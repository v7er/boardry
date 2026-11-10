import { parseNote } from "./parse.js";
import { parseLayerIndex } from "./layers.js";
import { noteFrontmatterSchema } from "./validate.js";
import { buildGraph, type GraphResult } from "./graph.js";
import { buildSearchIndex, type SearchDocument } from "./search.js";
import type { Note, NoteInput } from "./types.js";
import type MiniSearch from "minisearch";

export interface BuildResult {
  layers: string[];
  notes: Note[];
  brainstorming: Note[];
  graph: GraphResult;
  search: MiniSearch<SearchDocument>;
  errors: string[];
}

function toId(path: string): string {
  let p = path.replace(/\\/g, "/");
  if (p.startsWith(".boardry/")) p = p.slice(".boardry/".length);
  if (p.startsWith("./")) p = p.slice(2);
  return p.replace(/\.md$/, "");
}

export function buildKnowledge(indexMd: string, inputs: NoteInput[]): BuildResult {
  const layers = parseLayerIndex(indexMd);
  const errors: string[] = [];
  const notes: Note[] = [];
  const brainstorming: Note[] = [];

  for (const input of inputs) {
    const { frontmatter, body, wikilinks } = parseNote(input.content);
    const validated = noteFrontmatterSchema.safeParse(frontmatter);
    if (!validated.success) {
      const messages = validated.error.issues.map((issue) => issue.message).join(", ");
      errors.push(`${input.path}: ${messages}`);
      continue;
    }
    const fm = validated.data;
    const id = toId(input.path);
    const note: Note = {
      id,
      path: input.path,
      title: fm.title ?? id,
      layer: fm.layer,
      component: fm.component,
      kind: fm.kind,
      type: fm.type,
      summary: fm.summary,
      icon: fm.icon,
      source: input.source ?? "boardry",
      updated: fm.updated,
      tags: fm.tags ?? [],
      links: fm.links ?? [],
      wikilinks,
      body,
      raw: input.content,
    };
    const basename = input.path.split("/").pop() ?? input.path;
    if (note.type === "brainstorming" || basename.startsWith("_")) {
      brainstorming.push(note);
    } else {
      notes.push(note);
    }
  }

  const graph = buildGraph(notes);
  const search = buildSearchIndex(notes);

  return { layers, notes, brainstorming, graph, search, errors };
}

/** Add notes from another source (OpenWiki evidence) to an existing result. */
export function mergeKnowledge(result: BuildResult, extra: Note[]): BuildResult {
  const layers = result.layers.includes("evidence")
    ? result.layers
    : [...result.layers, "evidence"];
  const notes = [...result.notes, ...extra];
  return {
    layers,
    notes,
    brainstorming: result.brainstorming,
    graph: buildGraph(notes),
    search: buildSearchIndex(notes),
    errors: result.errors,
  };
}
