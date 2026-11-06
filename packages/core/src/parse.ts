import { parse as parseYaml } from "yaml";

export interface ParsedNote {
  frontmatter: Record<string, unknown>;
  body: string;
  wikilinks: string[];
}

function splitFrontmatter(raw: string): { data: Record<string, unknown>; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) {
    return { data: {}, body: raw };
  }
  const parsed = parseYaml(match[1] ?? "");
  const data = parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
  return { data, body: raw.slice(match[0].length) };
}

export function extractWikilinks(text: string): string[] {
  const links: string[] = [];
  const re = /\[\[([^\]|]+)(?:\|[^\]]*)?\]\]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const target = (m[1] ?? "").trim();
    if (target) links.push(target);
  }
  return links;
}

export function parseNote(raw: string): ParsedNote {
  const { data, body } = splitFrontmatter(raw);
  return { frontmatter: data, body, wikilinks: extractWikilinks(body) };
}
