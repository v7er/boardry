import { promises as fs } from "node:fs";
import path from "node:path";
import fg from "fast-glob";
import { buildKnowledge, type BuildResult, type Note } from "@boardy/core";

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

export async function findBoardyDir(start: string, explicit?: string): Promise<string | null> {
  if (explicit) {
    const abs = path.resolve(explicit);
    if (await hasIndex(abs)) return abs;
    const nested = path.join(abs, ".boardy");
    if (await hasIndex(nested)) return nested;
    return null;
  }

  let current = path.resolve(start);
  for (;;) {
    const candidate = path.join(current, ".boardy");
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
  const dir = await findBoardyDir(start, explicit);
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
      ignore: ["**/README.md", "**/.index/**", "**/node_modules/**"],
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
  const q = query.replace(/\.md$/, "").replace(/^\.?boardy\//, "");
  return result.notes.find((n) => n.id === q) ?? result.notes.find((n) => n.id.split("/").pop() === q);
}
