import type { Note } from "./types.js";

export interface Chunk {
  noteId: string;
  title: string;
  layer?: string;
  component?: string;
  kind?: string;
  summary?: string;
  section: string;
  text: string;
  line: number;
  links: { type: string; target: string }[];
}

/** Lines in the raw file before the body starts, so `line` is a real file line. */
function bodyOffset(note: Note): number {
  const rawLines = note.raw.split(/\r?\n/).length;
  const bodyLines = note.body.split(/\r?\n/).length;
  return Math.max(0, rawLines - bodyLines);
}

export function chunkNote(note: Note): Chunk[] {
  const offset = bodyOffset(note);
  const lines = note.body.split(/\r?\n/);
  const chunks: Chunk[] = [];
  let section = "";
  let start = offset + 1;
  let buffer: string[] = [];

  const flush = () => {
    const text = buffer.join("\n").trim();
    if (text) {
      chunks.push({
        noteId: note.id,
        title: note.title,
        layer: note.layer,
        component: note.component,
        kind: note.kind,
        summary: note.summary,
        section,
        text,
        line: start,
        links: note.links,
      });
    }
    buffer = [];
  };

  lines.forEach((line, index) => {
    if (/^#{1,6}\s+/.test(line)) {
      flush();
      section = line.trim();
      start = offset + index + 2;
      return;
    }
    buffer.push(line);
  });
  flush();

  return chunks;
}

export function chunkNotes(notes: Note[]): Chunk[] {
  return notes.flatMap(chunkNote);
}
