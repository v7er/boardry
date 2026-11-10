import type { Note } from "./types.js";
import type { BuildResult } from "./engine.js";

export interface BridgeEntry {
  noteId: string;
  pageId: string;
  noteUpdated?: string;
  pageVerified?: string;
  status: "matched" | "evidence-stale";
}

export interface BridgeResult {
  entries: BridgeEntry[];
  unclaimedPages: string[];
  unverifiedNotes: string[];
  noteToPage: Record<string, string>;
}

const EVIDENCE_LAYERS = new Set(["components", "prototypes", "modules", "technical"]);

function slugOf(id: string): string {
  return (id.split("/").pop() ?? id).toLowerCase();
}

/**
 * Link intent notes (boardry) to evidence pages (OpenWiki) by slug, component,
 * or an explicit `openwiki:` link. Nothing is written to either source.
 */
export function buildBridge(result: BuildResult): BridgeResult {
  const notes = result.notes.filter((note) => note.source !== "openwiki");
  const pages = result.notes.filter((note) => note.source === "openwiki");

  const pageBySlug = new Map<string, Note>();
  for (const page of pages) pageBySlug.set(slugOf(page.id), page);

  const entries: BridgeEntry[] = [];
  const claimed = new Set<string>();
  const unverifiedNotes: string[] = [];
  const noteToPage: Record<string, string> = {};

  for (const note of notes) {
    const explicit = note.links.find((link) => link.target.startsWith("openwiki:"));
    const candidates = [
      explicit ? explicit.target.replace(/^openwiki:/, "") : undefined,
      note.component,
      slugOf(note.id),
    ].filter((value): value is string => Boolean(value));

    const page = candidates
      .map((candidate) => pageBySlug.get(candidate.toLowerCase()))
      .find((found): found is Note => Boolean(found));

    if (!page) {
      if (note.layer && EVIDENCE_LAYERS.has(note.layer)) unverifiedNotes.push(note.id);
      continue;
    }

    claimed.add(page.id);
    noteToPage[note.id] = page.id;
    const noteUpdated = note.updated;
    const pageVerified = page.updated;
    const status =
      noteUpdated && pageVerified && noteUpdated > pageVerified ? "evidence-stale" : "matched";
    entries.push({ noteId: note.id, pageId: page.id, noteUpdated, pageVerified, status });
  }

  return {
    entries,
    unclaimedPages: pages.filter((page) => !claimed.has(page.id)).map((page) => page.id),
    unverifiedNotes,
    noteToPage,
  };
}
