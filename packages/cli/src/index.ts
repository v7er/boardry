#!/usr/bin/env node
import { Command } from "commander";
import chalk from "chalk";
import { promises as fs } from "node:fs";
import path from "node:path";
import { createServer } from "node:http";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";
import sirv from "sirv";
import { loadKnowledge, findBoardyDir, findNote } from "./context.js";

const program = new Command();

program
  .name("boardy")
  .description("The document centre for your product")
  .version("0.1.0");

const DEFAULT_LAYERS = "brief,components,prototypes,modules,technical,whitelist";

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "note"
  );
}

function normalizeTarget(target: string): string {
  return target.replace(/^\[\[/, "").replace(/\]\]$/, "").trim();
}

function editLinks(
  raw: string,
  fn: (links: { type: string; target: string }[]) => { type: string; target: string }[],
): string {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  const fmText = match ? (match[1] ?? "") : "";
  const parsed = parseYaml(fmText) ?? {};
  const fm = (parsed && typeof parsed === "object" ? parsed : {}) as Record<string, unknown>;
  const links = Array.isArray(fm.links) ? (fm.links as { type: string; target: string }[]) : [];
  fm.links = fn(links);
  const newFm = stringifyYaml(fm);
  const body = match ? raw.slice(match[0].length) : raw;
  return `---\n${newFm}---\n${body}`;
}

async function loadOrFail() {
  const loaded = await loadKnowledge(process.cwd());
  if (!loaded) {
    console.error(chalk.red("No .boardy/ folder found. Run `boardy init` first."));
    process.exit(1);
  }
  return loaded;
}

async function boardyDirOrFail() {
  const dir = await findBoardyDir(process.cwd());
  if (!dir) {
    console.error(chalk.red("No .boardy/ folder found. Run `boardy init` first."));
    process.exit(1);
  }
  return dir;
}

async function readStdin(): Promise<string> {
  return new Promise((resolve) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => resolve(data.trim()));
  });
}

program
  .command("init")
  .description("set up .boardy/ with index.md, .gitignore, and starter notes")
  .option("--layers <names>", "comma-separated layer list", DEFAULT_LAYERS)
  .action(async (opts: { layers: string }) => {
    const root = process.cwd();
    const boardyDir = path.join(root, ".boardy");
    const layers = opts.layers.split(",").map((s) => s.trim()).filter(Boolean);

    await fs.mkdir(boardyDir, { recursive: true });
    const indexMd = `---\ntitle: Layers\nlayers:\n${layers.map((l) => `  - ${l}`).join("\n")}\n---\n`;
    await fs.writeFile(path.join(boardyDir, "index.md"), indexMd);
    await fs.writeFile(path.join(boardyDir, ".gitignore"), ".index/\n");
    console.log(chalk.green(`Initialized ${boardyDir} with ${layers.length} layers: ${layers.join(", ")}`));
  });

program
  .command("index")
  .description("rebuild the graph index in .boardy/.index/")
  .option("-w, --watch", "re-index as files change")
  .action(async (opts: { watch?: boolean }) => {
    const loaded = await loadOrFail();
    const summary = summarize(loaded.result.layers, loaded.result.notes);
    const exported = loaded.result.graph.graph.export();
    const cache = {
      generatedAt: new Date().toISOString(),
      layers: loaded.result.layers,
      notes: loaded.result.notes.map((note) => ({
        id: note.id,
        title: note.title,
        layer: note.layer,
        component: note.component,
        kind: note.kind,
        path: note.path,
        links: note.links,
        wikilinks: note.wikilinks,
      })),
      brainstorming: loaded.result.brainstorming.map((note) => ({ id: note.id, title: note.title })),
      edges: exported.edges.map((edge) => ({
        source: edge.source,
        target: edge.target,
        label: edge.attributes?.label,
      })),
    };
    const indexDir = path.join(loaded.dir, ".index");
    const indexFile = path.join(indexDir, "index.json");
    await fs.mkdir(indexDir, { recursive: true });
    await fs.writeFile(indexFile, JSON.stringify(cache, null, 2));
    console.log(chalk.green(summary));
    console.log(chalk.dim(`wrote ${path.relative(loaded.dir, indexFile)}`));
    if (opts.watch) {
      const { watch } = await import("chokidar");
      const watcher = watch(path.join(loaded.dir, "**/*.md"), { ignoreInitial: true });
      watcher.on("all", () => {
        console.log(chalk.dim("change detected, re-indexing"));
        loadKnowledge(process.cwd()).then(() => console.log(chalk.green("re-indexed")));
      });
      console.log(chalk.dim("watching for changes..."));
    }
  });

program
  .command("ask <question>")
  .description("ranked notes and their links")
  .action(async (question: string) => {
    const loaded = await loadOrFail();
    const results = loaded.result.search.search(question, { prefix: true, boost: { title: 2 } });
    if (results.length === 0) {
      console.log("No matches.");
      return;
    }
    for (const r of results.slice(0, 10)) {
      const note = loaded.result.notes.find((n) => n.id === r.id);
      const layer = note?.layer ? chalk.dim(`[${note.layer}]`) : "";
      console.log(`${chalk.bold(r.title)} ${layer}`);
      const links = note?.links.map((l) => `${l.type} ${l.target}`).join(", ");
      if (links) console.log(chalk.dim(`  ${links}`));
    }
  });

program
  .command("search <term>")
  .description("full-text search over notes")
  .action(async (term: string) => {
    const loaded = await loadOrFail();
    const results = loaded.result.search.search(term, { prefix: true });
    if (results.length === 0) {
      console.log("No matches.");
      return;
    }
    for (const r of results.slice(0, 20)) {
      console.log(`${chalk.bold(r.title)} ${chalk.dim(r.id)}`);
    }
  });

program
  .command("show <path>")
  .description("print a note")
  .action(async (query: string) => {
    const loaded = await loadOrFail();
    const note = findNote(loaded.result, query);
    if (!note) {
      console.error(chalk.red(`Note not found: ${query}`));
      process.exit(1);
    }
    console.log(note.raw);
  });

program
  .command("links <path>")
  .description("every edge into and out of a note")
  .action(async (query: string) => {
    const loaded = await loadOrFail();
    const note = findNote(loaded.result, query);
    if (!note) {
      console.error(chalk.red(`Note not found: ${query}`));
      process.exit(1);
    }
    const out = loaded.result.graph.graph.outEdges(note.id).map((edgeKey) => {
      const target = loaded.result.graph.graph.target(edgeKey);
      const label = loaded.result.graph.graph.getEdgeAttribute(edgeKey, "label");
      return `${note.id} -> ${target} ${label}`;
    });
    const incoming = loaded.result.graph.backlinks.get(note.id) ?? [];
    console.log(chalk.bold("out:"));
    out.forEach((l) => console.log(`  ${l}`));
    console.log(chalk.bold("in:"));
    incoming.forEach((src) => console.log(`  ${src} -> ${note.id}`));
  });

program
  .command("backlinks <path>")
  .description("every note that points at this one")
  .action(async (query: string) => {
    const loaded = await loadOrFail();
    const note = findNote(loaded.result, query);
    if (!note) {
      console.error(chalk.red(`Note not found: ${query}`));
      process.exit(1);
    }
    const incoming = loaded.result.graph.backlinks.get(note.id) ?? [];
    if (incoming.length === 0) {
      console.log("No backlinks.");
      return;
    }
    incoming.forEach((src) => console.log(`${src} -> ${note.id}`));
  });

program
  .command("layers")
  .description("the layers from index.md and their notes, top to bottom")
  .action(async () => {
    const loaded = await loadOrFail();
    for (const layer of loaded.result.layers) {
      const count = loaded.result.notes.filter((n) => n.layer === layer).length;
      console.log(`${chalk.bold(layer)} ${chalk.dim(`(${count})`)}`);
    }
  });

program
  .command("brief")
  .description("the first layer, the vision")
  .action(async () => {
    const loaded = await loadOrFail();
    const first = loaded.result.layers[0];
    if (!first) {
      console.log("No layers declared.");
      return;
    }
    for (const note of loaded.result.notes.filter((n) => n.layer === first)) {
      console.log(chalk.bold(note.title));
      console.log(note.body.trim());
      console.log("");
    }
  });

program
  .command("components")
  .description("the components layer and submodules")
  .action(async () => {
    const loaded = await loadOrFail();
    const layer = loaded.result.layers[1] ?? "components";
    for (const note of loaded.result.notes.filter((n) => n.layer === layer)) {
      console.log(chalk.bold(note.title));
    }
  });

program
  .command("fit <path>")
  .description("what LayerAI maps onto a note, module, or layer")
  .action(async (query: string) => {
    const loaded = await loadOrFail();
    const note = findNote(loaded.result, query);
    const target = note?.id ?? query;
    const matches = loaded.result.notes.filter(
      (n) => (n.layer === "ai" || n.path.startsWith("ai/")) && n.raw.includes(target),
    );
    if (matches.length === 0) {
      console.log("No AI mappings found.");
      return;
    }
    for (const m of matches) {
      console.log(`${chalk.bold(m.title)} ${chalk.dim(m.id)}`);
      console.log(m.body.trim());
      console.log("");
    }
  });

program
  .command("add")
  .description("open a template for a new note")
  .requiredOption("-l, --layer <layer>", "layer name")
  .option("-t, --title <title>", "note title")
  .action(async (opts: { layer: string; title?: string }) => {
    const dir = await boardyDirOrFail();
    const title = opts.title ?? "Untitled";
    const id = slugify(title);
    const target = path.join(dir, opts.layer, `${id}.md`);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, `---\ntitle: ${title}\nlayer: ${opts.layer}\n---\n\n`);
    console.log(chalk.green(`Created ${path.relative(dir, target)}`));
  });

program
  .command("note <title>")
  .description("add a note from text on stdin")
  .requiredOption("-l, --layer <layer>", "layer name")
  .action(async (title: string, opts: { layer: string }) => {
    const dir = await boardyDirOrFail();
    const body = await readStdin();
    const id = slugify(title);
    const target = path.join(dir, opts.layer, `${id}.md`);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, `---\ntitle: ${title}\nlayer: ${opts.layer}\n---\n\n${body}\n`);
    console.log(chalk.green(`Created ${path.relative(dir, target)}`));
  });

program
  .command("link <a> <b>")
  .description("add a typed edge from a to b")
  .option("-t, --type <verb>", "edge verb", "relates_to")
  .action(async (a: string, b: string, opts: { type: string }) => {
    const loaded = await loadOrFail();
    const noteA = findNote(loaded.result, a);
    const noteB = findNote(loaded.result, b);
    if (!noteA || !noteB) {
      console.error(chalk.red("Note not found."));
      process.exit(1);
    }
    const full = path.join(loaded.dir, noteA.path);
    const raw = await fs.readFile(full, "utf8");
    const edited = editLinks(raw, (links) => [...links, { type: opts.type, target: `[[${noteB.id}]]` }]);
    await fs.writeFile(full, edited);
    console.log(chalk.green(`Linked ${noteA.id} -> ${noteB.id} (${opts.type})`));
  });

program
  .command("unlink <a> <b>")
  .description("remove an edge from a to b")
  .action(async (a: string, b: string) => {
    const loaded = await loadOrFail();
    const noteA = findNote(loaded.result, a);
    const noteB = findNote(loaded.result, b);
    if (!noteA || !noteB) {
      console.error(chalk.red("Note not found."));
      process.exit(1);
    }
    const full = path.join(loaded.dir, noteA.path);
    const raw = await fs.readFile(full, "utf8");
    const edited = editLinks(raw, (links) => links.filter((l) => normalizeTarget(l.target) !== noteB.id));
    await fs.writeFile(full, edited);
    console.log(chalk.green(`Unlinked ${noteA.id} -> ${noteB.id}`));
  });

program
  .command("check")
  .description("orphans, broken links, broken waterfall (exit 1 on a problem)")
  .action(async () => {
    const loaded = await loadOrFail();
    const problems: string[] = [];
    for (const orphan of loaded.result.graph.orphans) {
      problems.push(`orphan: ${orphan}`);
    }
    for (const broken of loaded.result.graph.brokenLinks) {
      problems.push(`broken link: ${broken}`);
    }
    for (const note of loaded.result.notes) {
      if (!note.layer) {
        problems.push(`missing layer: ${note.id}`);
      } else if (!loaded.result.layers.includes(note.layer)) {
        problems.push(`unknown layer "${note.layer}": ${note.id}`);
      }
    }
    if (problems.length === 0) {
      console.log(chalk.green("No problems."));
      return;
    }
    problems.forEach((p) => console.log(chalk.yellow(p)));
    process.exit(1);
  });

program
  .command("status")
  .description("note count, link count, and what changed")
  .action(async () => {
    const loaded = await loadOrFail();
    console.log(summarize(loaded.result.layers, loaded.result.notes));
    console.log(`brainstorming notes: ${loaded.result.brainstorming.length} (ignored)`);
    console.log(`errors: ${loaded.result.errors.length}`);
  });

program
  .command("serve")
  .description("local read-only graph viewer")
  .option("-p, --port <port>", "port", "4173")
  .action(async (opts: { port: string }) => {
    const loaded = await loadOrFail();
    const siteDir = path.join(loaded.dir, ".index", "site");
    await fs.mkdir(siteDir, { recursive: true });
    const data = {
      layers: loaded.result.layers,
      notes: loaded.result.notes.map((n) => ({
        id: n.id,
        title: n.title,
        layer: n.layer,
        kind: n.kind,
        links: n.links,
        wikilinks: n.wikilinks,
      })),
      edges: loaded.result.graph.graph.export().edges.map((e) => ({
        source: e.source,
        target: e.target,
        label: e.attributes?.label,
      })),
    };
    await fs.writeFile(path.join(siteDir, "data.json"), JSON.stringify(data, null, 2));
    await fs.writeFile(path.join(siteDir, "index.html"), VIEWER_HTML);
    const handler = sirv(siteDir, { dev: true });
    const server = createServer((req, res) => handler(req, res));
    server.listen(Number(opts.port), () => {
      console.log(chalk.green(`Viewer on http://localhost:${opts.port}`));
    });
  });

function summarize(layers: string[], notes: { layer?: string }[]): string {
  const byLayer = new Map<string, number>();
  for (const note of notes) {
    const key = note.layer ?? "(none)";
    byLayer.set(key, (byLayer.get(key) ?? 0) + 1);
  }
  const parts: string[] = [`${notes.length} notes, ${layers.length} layers`];
  for (const layer of layers) {
    const count = byLayer.get(layer) ?? 0;
    parts.push(`${layer}: ${count}`);
  }
  return parts.join(" | ");
}

const VIEWER_HTML = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>boardy viewer</title>
<style>
  body { font-family: system-ui, sans-serif; margin: 2rem; max-width: 70rem; color: #1a1a1a; }
  h1 { font-size: 1.4rem; }
  .layer { margin-top: 1.6rem; border-bottom: 1px solid #e2e2e2; padding-bottom: .3rem; }
  ul { padding-left: 1.2rem; }
  li { margin: .35rem 0; }
  .muted { color: #888; }
</style>
</head>
<body>
<h1>boardy</h1>
<div id="app"></div>
<script>
fetch('data.json').then(function (r) { return r.json(); }).then(function (d) {
  var app = document.getElementById('app');
  var byLayer = {};
  d.notes.forEach(function (n) {
    var key = n.layer || '(none)';
    (byLayer[key] = byLayer[key] || []).push(n);
  });
  var order = d.layers.concat(['(none)']);
  order.forEach(function (layer) {
    var notes = byLayer[layer] || [];
    if (!notes.length) return;
    var h = document.createElement('h2');
    h.className = 'layer';
    h.textContent = layer;
    app.appendChild(h);
    var ul = document.createElement('ul');
    notes.forEach(function (n) {
      var li = document.createElement('li');
      var text = '<strong>' + n.title + '</strong> <span class="muted">(' + n.id + ')</span>';
      if (n.links && n.links.length) {
        text += ' &middot; ' + n.links.map(function (l) { return l.type + ' ' + l.target; }).join(', ');
      }
      li.innerHTML = text;
      ul.appendChild(li);
    });
    app.appendChild(ul);
  });
});
</script>
</body>
</html>`;

program.parseAsync(process.argv);
