import { parse as parseYaml } from "yaml";
import type { Note, NoteEvidence } from "./types.js";

export interface OpenWikiPage {
  id: string;
  title: string;
  path: string;
  type: string;
  verified?: string;
  generated?: string;
  sources: NoteEvidence[];
  body: string;
  raw: string;
}

const RESERVED = new Set(["index.md", "log.md", "instructions.md", "readme.md"]);

export function isOpenWikiPage(pagePath: string): boolean {
  const name = (pagePath.split("/").pop() ?? pagePath).toLowerCase();
  if (!name.endsWith(".md")) return false;
  if (RESERVED.has(name)) return false;
  return !pagePath.split("/").some((segment) => segment.startsWith("."));
}

export function parseSourceRef(value: unknown): NoteEvidence | null {
  if (typeof value === "string") {
    const match = value.match(/^repo:\/\/(.+?)(?:#L(\d+)(?:-L\d+)?)?$/);
    if (!match) return null;
    return { path: match[1] ?? value, line: Number(match[2] ?? 1) };
  }
  if (value && typeof value === "object") {
    const item = value as { path?: unknown; line?: unknown };
    if (typeof item.path === "string") {
      return { path: item.path, line: Number(item.line ?? 1) };
    }
  }
  return null;
}

function readStamp(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const at = (value as { at?: unknown }).at;
    if (typeof at === "string") return at;
  }
  return undefined;
}

export function parseOpenWikiPage(pagePath: string, raw: string): OpenWikiPage {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  const body = match ? raw.slice(match[0].length) : raw;
  const parsed = match ? parseYaml(match[1] ?? "") : null;
  const frontmatter =
    parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
  const file = pagePath.split("/").pop() ?? pagePath;
  const id = file.replace(/\.md$/, "");
  const sourcesRaw = Array.isArray(frontmatter.sources) ? frontmatter.sources : [];

  return {
    id,
    title: typeof frontmatter.title === "string" ? frontmatter.title : id,
    path: pagePath,
    type: typeof frontmatter.type === "string" ? frontmatter.type : "page",
    verified: readStamp(frontmatter.verified),
    generated: readStamp(frontmatter.generated),
    sources: sourcesRaw
      .map(parseSourceRef)
      .filter((item): item is NoteEvidence => Boolean(item)),
    body,
    raw,
  };
}

export function openwikiToNotes(pages: OpenWikiPage[]): Note[] {
  return pages.map((page) => ({
    id: `evidence/${page.id}`,
    path: page.path,
    title: page.title,
    layer: "evidence",
    kind: page.type,
    source: "openwiki",
    updated: page.verified,
    evidence: page.sources,
    tags: [],
    links: [],
    wikilinks: [],
    body: page.body,
    raw: page.raw,
  }));
}
