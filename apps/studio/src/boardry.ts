import { invoke } from "@tauri-apps/api/core";
import { buildKnowledge, type BuildResult } from "@boardry/core";

export interface LoadedBoardry {
  boardryDir: string;
  result: BuildResult;
  files: { path: string; content: string }[];
}

interface BoardryLoad {
  boardry_dir: string;
  index_md: string;
  notes: { path: string; content: string }[];
  files: { path: string; content: string }[];
}

/**
 * Ask the Rust side to read the folder. This avoids the fs plugin scope,
 * which blocks hidden paths such as `.boardry/`.
 */
export async function loadBoardry(folder: string): Promise<LoadedBoardry | null> {
  try {
    const data = await invoke<BoardryLoad>("load_boardry", { folder });
    const result = buildKnowledge(data.index_md, data.notes);
    return { boardryDir: data.boardry_dir, result, files: data.files };
  } catch {
    return null;
  }
}

export async function saveNote(boardryDir: string, path: string, content: string): Promise<void> {
  await invoke("save_note", { dir: boardryDir, path, content });
}

export async function moveNote(
  boardryDir: string,
  from: string,
  to: string,
  content: string,
): Promise<void> {
  await invoke("move_note", { dir: boardryDir, from, to, content });
}

export async function deleteNote(boardryDir: string, path: string): Promise<void> {
  await invoke("delete_note", { dir: boardryDir, path });
}

export interface LayerIndex {
  path: string;
  content: string;
}

export async function readLayerIndex(
  boardryDir: string,
  layer: string,
): Promise<LayerIndex | null> {
  return invoke<LayerIndex | null>("read_layer_index", { dir: boardryDir, layer });
}

/** Return a copy of the note with its `layer` frontmatter set to `layer`. */
export function setLayer(raw: string, layer: string): string {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return `---\nlayer: ${layer}\n---\n${raw}`;
  const frontmatter = match[1] ?? "";
  const body = raw.slice(match[0].length);
  const lines = frontmatter.split(/\r?\n/);
  let found = false;
  const next = lines.map((line) => {
    if (/^layer\s*:/.test(line.trim())) {
      found = true;
      return `layer: ${layer}`;
    }
    return line;
  });
  if (!found) next.push(`layer: ${layer}`);
  return `---\n${next.join("\n")}\n---\n${body}`;
}

