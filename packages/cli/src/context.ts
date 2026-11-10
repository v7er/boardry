import { promises as fs } from "node:fs";
import path from "node:path";
import fg from "fast-glob";
import {
  buildKnowledge,
  isOpenWikiPage,
  parseOpenWikiPage,
  parseQaEntry,
  type BuildResult,
  type Note,
  type OpenWikiPage,
  type QaEntry,
} from "@boardry/core";

export interface LoadedKnowledge {
  dir: string;
  result: BuildResult;
}

async function hasIndex(dir: string): Promise<boolean> {
  try {
    return (await fs.stat(path.join(dir, "index.md"))).isFile();
  } catch {
    return false;
  }
}

export async function findBoardryDir(start: string, explicit?: string): Promise<string | null> {
  if (explicit) {
    const abs = path.resolve(explicit);
    if (await hasIndex(abs)) return abs;
    const nested = path.join(abs, ".boardry");
    if (await hasIndex(nested)) return nested;
    return null;
  }

  let current = path.resolve(start);
  for (;;) {
    const candidate = path.join(current, ".boardry");
    try {
      const stat = await fs.stat(candidate);
      if (stat.isDirectory()) return candidate;
    } catch {
      // keep walking up
    }
    const parent = path.dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}

export async function loadKnowledge(start: string, explicit?: string): Promise<LoadedKnowledge | null> {
  const dir = await findBoardryDir(start, explicit);
  if (!dir) return null;

  const indexPath = path.join(dir, "index.md");
  let indexMd = "";
  try {
    indexMd = await fs.readFile(indexPath, "utf8");
  } catch {
    indexMd = "";
  }

  const files = (
    await fg("**/*.md", {
      cwd: dir,
      dot: true,
      ignore: ["**/README.md", "**/.index/**", "**/node_modules/**", "**/questions/**"],
    })
  ).filter((file) => path.basename(file).toLowerCase() !== "index.md");
  const notes: { path: string; content: string }[] = [];
  for (const file of files) {
    const content = await fs.readFile(path.join(dir, file), "utf8");
    notes.push({ path: file, content });
  }

  const result = buildKnowledge(indexMd, notes);
  return { dir, result };
}

export function findNote(result: BuildResult, query: string): Note | undefined {
  const q = query.replace(/\.md$/, "").replace(/^\.?boardry\//, "");
  return result.notes.find((n) => n.id === q) ?? result.notes.find((n) => n.id.split("/").pop() === q);
}

export interface LoadedOpenWiki {
  dir: string;
  pages: OpenWikiPage[];
}

/** Read the verified question index from `<boardryDir>/questions/`. */
export async function loadQaEntries(boardryDir: string): Promise<QaEntry[]> {
  const dir = path.join(boardryDir, "questions");
  let files: string[] = [];
  try {
    files = await fg("*.md", { cwd: dir, dot: false });
  } catch {
    return [];
  }
  const entries: QaEntry[] = [];
  for (const file of files) {
    const content = await fs.readFile(path.join(dir, file), "utf8");
    const entry = parseQaEntry(file, content);
    if (entry) entries.push(entry);
  }
  return entries;
}

/** Read an OpenWiki folder (sibling of the boardry folder by default). */
export async function loadOpenWiki(
  boardryDir: string,
  explicit?: string,
): Promise<LoadedOpenWiki | null> {
  const dir = explicit ? path.resolve(explicit) : path.join(path.dirname(boardryDir), "openwiki");

  let isDir = false;
  try {
    isDir = (await fs.stat(dir)).isDirectory();
  } catch {
    isDir = false;
  }
  if (!isDir) return null;

  const files = await fg("**/*.md", {
    cwd: dir,
    dot: false,
    ignore: ["**/.*/**", "**/node_modules/**"],
  });
  const pages: OpenWikiPage[] = [];
  for (const file of files) {
    if (!isOpenWikiPage(file)) continue;
    const content = await fs.readFile(path.join(dir, file), "utf8");
    pages.push(parseOpenWikiPage(file, content));
  }
  return { dir, pages };
}
