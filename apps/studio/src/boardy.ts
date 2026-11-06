import { invoke } from "@tauri-apps/api/core";
import { buildKnowledge, type BuildResult } from "@boardy/core";

export interface LoadedBoardy {
  boardyDir: string;
  result: BuildResult;
}

interface BoardyLoad {
  boardy_dir: string;
  index_md: string;
  notes: { path: string; content: string }[];
}

/**
 * Ask the Rust side to read the folder. This avoids the fs plugin scope,
 * which blocks hidden paths such as `.boardy/`.
 */
export async function loadBoardy(folder: string): Promise<LoadedBoardy | null> {
  try {
    const data = await invoke<BoardyLoad>("load_boardy", { folder });
    const result = buildKnowledge(data.index_md, data.notes);
    return { boardyDir: data.boardy_dir, result };
  } catch {
    return null;
  }
}

export async function saveNote(boardyDir: string, path: string, content: string): Promise<void> {
  await invoke("save_note", { dir: boardyDir, path, content });
}
