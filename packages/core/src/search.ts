import MiniSearch from "minisearch";
import type { Note } from "./types.js";

export interface SearchDocument {
  id: string;
  title: string;
  body: string;
  tags: string;
  layer?: string;
  kind?: string;
}

export function buildSearchIndex(notes: Note[]): MiniSearch<SearchDocument> {
  const mini = new MiniSearch<SearchDocument>({
    fields: ["title", "body", "tags"],
    storeFields: ["id", "title", "layer", "kind"],
  });
  mini.addAll(
    notes.map((note) => ({
      id: note.id,
      title: note.title,
      body: note.body,
      tags: note.tags.join(" "),
      layer: note.layer,
      kind: note.kind,
    })),
  );
  return mini;
}
