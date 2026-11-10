import { parseNote, type BuildResult } from "@boardry/core";

export interface SplitNote {
  frontmatterText: string;
  frontmatter: Record<string, unknown>;
  body: string;
  wikilinks: string[];
}

export function splitNote(raw: string): SplitNote {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  const parsed = parseNote(raw);
  return {
    frontmatterText: match ? (match[1] ?? "") : "",
    frontmatter: parsed.frontmatter,
    body: parsed.body,
    wikilinks: parsed.wikilinks,
  };
}

export function joinNote(frontmatterText: string, body: string): string {
  if (!frontmatterText.trim()) return body;
  return `---\n${frontmatterText}\n---\n${body}`;
}

export function resolveNoteId(result: BuildResult, target: string): string | undefined {
  const clean = target.replace(/^\[\[/, "").replace(/\]\]$/, "").trim();
  if (!clean) return undefined;
  const direct = result.notes.find((note) => note.id === clean);
  if (direct) return direct.id;
  const base = clean.split("/").pop() ?? clean;
  return result.notes.find((note) => note.id.split("/").pop() === base)?.id;
}

export function noteTitle(result: BuildResult, id: string): string {
  return result.notes.find((note) => note.id === id)?.title ?? id;
}
