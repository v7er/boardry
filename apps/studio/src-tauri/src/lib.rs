use std::path::{Path, PathBuf};

#[derive(serde::Serialize)]
struct BoardyNote {
    path: String,
    content: String,
}

#[derive(serde::Serialize)]
struct BoardyLoad {
    boardy_dir: String,
    index_md: String,
    notes: Vec<BoardyNote>,
}

fn resolve_boardy_dir(folder: &str) -> Result<PathBuf, String> {
    let trimmed = folder.trim_end_matches('/');
    let path = PathBuf::from(trimmed);

    // The selected folder is the .boardy folder itself.
    if trimmed.ends_with(".boardy") && path.join("index.md").exists() {
        return Ok(path);
    }

    // The selected folder is a project root that contains .boardy/.
    let nested = path.join(".boardy");
    if nested.join("index.md").exists() {
        return Ok(nested);
    }

    // The selected folder is a boardy folder under another name.
    if path.join("index.md").exists() && path.join(".gitignore").exists() {
        return Ok(path);
    }

    Err(format!("no .boardy/index.md found in {folder}"))
}

fn collect_notes(root: &Path, dir: &Path, out: &mut Vec<BoardyNote>) -> Result<(), String> {
    for entry in std::fs::read_dir(dir).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let name = entry.file_name().to_string_lossy().to_string();
        if name.starts_with('.') {
            continue;
        }
        let path = entry.path();
        if path.is_dir() {
            collect_notes(root, &path, out)?;
        } else if name.ends_with(".md") && name != "index.md" {
            let rel = path
                .strip_prefix(root)
                .map_err(|e| e.to_string())?
                .to_string_lossy()
                .replace('\\', "/");
            let content = std::fs::read_to_string(&path).map_err(|e| e.to_string())?;
            out.push(BoardyNote { path: rel, content });
        }
    }
    Ok(())
}

#[tauri::command]
fn load_boardy(folder: String) -> Result<BoardyLoad, String> {
    let boardy_dir = resolve_boardy_dir(&folder)?;
    let index_md = std::fs::read_to_string(boardy_dir.join("index.md")).unwrap_or_default();
    let mut notes = Vec::new();
    collect_notes(&boardy_dir, &boardy_dir, &mut notes)?;
    Ok(BoardyLoad {
        boardy_dir: boardy_dir.to_string_lossy().to_string(),
        index_md,
        notes,
    })
}

#[tauri::command]
fn save_note(dir: String, path: String, content: String) -> Result<(), String> {
    let full = PathBuf::from(&dir).join(&path);
    if let Some(parent) = full.parent() {
        std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    std::fs::write(&full, content).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![load_boardy, save_note])
        .run(tauri::generate_context!())
        .expect("error while running boardy Studio");
}
