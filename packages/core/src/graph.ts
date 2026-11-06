import Graph from "graphology";
import type { Note } from "./types.js";

export interface GraphResult {
  graph: Graph;
  backlinks: Map<string, string[]>;
  orphans: string[];
  brokenLinks: string[];
}

function normalizeTarget(target: string): string {
  return target.replace(/^\[\[/, "").replace(/\]\]$/, "").trim();
}

export function buildGraph(notes: Note[]): GraphResult {
  const graph = new Graph({ type: "directed", multi: true });
  const backlinks = new Map<string, string[]>();
  const ids = new Set<string>();
  const byBasename = new Map<string, string>();

  for (const note of notes) {
    graph.addNode(note.id, {
      title: note.title,
      layer: note.layer,
      kind: note.kind,
      type: note.type,
    });
    backlinks.set(note.id, []);
    ids.add(note.id);
    const base = note.id.split("/").pop() ?? note.id;
    byBasename.set(base, note.id);
  }

  const brokenLinks: string[] = [];
  const resolve = (target: string): string | undefined => {
    if (ids.has(target)) return target;
    const base = target.split("/").pop() ?? target;
    return byBasename.get(base);
  };

  const addEdge = (source: string, targetRaw: string, label: string) => {
    const normalized = normalizeTarget(targetRaw);
    const target = resolve(normalized);
    if (!target) {
      brokenLinks.push(`${source} -> ${normalized}`);
      return;
    }
    graph.addEdge(source, target, { label });
    backlinks.get(target)?.push(source);
  };

  for (const note of notes) {
    for (const link of note.links) {
      addEdge(note.id, link.target, link.type);
    }
    for (const wl of note.wikilinks) {
      addEdge(note.id, wl, "relates_to");
    }
  }

  const orphans: string[] = [];
  for (const note of notes) {
    if (graph.inDegree(note.id) === 0 && graph.outDegree(note.id) === 0) {
      orphans.push(note.id);
    }
  }

  return { graph, backlinks, orphans, brokenLinks };
}
