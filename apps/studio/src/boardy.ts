import { invoke } from "@tauri-apps/api/core";
import { buildKnowledge, type BuildResult } from "@boardy/core";

export interface LoadedBoardy {
  boardyDir: string;
  result: BuildResult;
  files: { path: string; content: string }[];
}

interface BoardyLoad {
  boardy_dir: string;
  index_md: string;
  notes: { path: string; content: string }[];
  files: { path: string; content: string }[];
}

/**
 * Ask the Rust side to read the folder. This avoids the fs plugin scope,
 * which blocks hidden paths such as `.boardy/`.
 */
export async function loadBoardy(folder: string): Promise<LoadedBoardy | null> {
  try {
    const data = await invoke<BoardyLoad>("load_boardy", { folder });
    const result = buildKnowledge(data.index_md, data.notes);
    return { boardyDir: data.boardy_dir, result, files: data.files };
  } catch {
    return null;
  }
}

export async function saveNote(boardyDir: string, path: string, content: string): Promise<void> {
  await invoke("save_note", { dir: boardyDir, path, content });
}

export async function moveNote(
  boardyDir: string,
  from: string,
  to: string,
  content: string,
): Promise<void> {
  await invoke("move_note", { dir: boardyDir, from, to, content });
}

export async function deleteNote(boardyDir: string, path: string): Promise<void> {
  await invoke("delete_note", { dir: boardyDir, path });
}

export interface LayerIndex {
  path: string;
  content: string;
}

export async function readLayerIndex(
  boardyDir: string,
  layer: string,
): Promise<LayerIndex | null> {
  return invoke<LayerIndex | null>("read_layer_index", { dir: boardyDir, layer });
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

