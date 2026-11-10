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
    files: Vec<BoardyNote>,
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
            if name == "questions" {
                continue;
            }
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

fn collect_files(root: &Path, dir: &Path, out: &mut Vec<BoardyNote>) -> Result<(), String> {
    for entry in std::fs::read_dir(dir).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let name = entry.file_name().to_string_lossy().to_string();
        if name.starts_with('.') {
            continue;
        }
        let path = entry.path();
        if path.is_dir() {
            collect_files(root, &path, out)?;
        } else if name.ends_with(".md") {
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
    let mut files = Vec::new();
    collect_files(&boardy_dir, &boardy_dir, &mut files)?;
    Ok(BoardyLoad {
        boardy_dir: boardy_dir.to_string_lossy().to_string(),
        index_md,
        notes,
        files,
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

#[tauri::command]
fn move_note(dir: String, from: String, to: String, content: String) -> Result<(), String> {
    let to_path = PathBuf::from(&dir).join(&to);
    if let Some(parent) = to_path.parent() {
        std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    std::fs::write(&to_path, content).map_err(|e| e.to_string())?;
    let from_path = PathBuf::from(&dir).join(&from);
    if from_path != to_path {
        std::fs::remove_file(&from_path).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn delete_note(dir: String, path: String) -> Result<(), String> {
    let full = PathBuf::from(&dir).join(&path);
    std::fs::remove_file(&full).map_err(|e| e.to_string())
}

#[derive(serde::Serialize)]
struct LayerIndex {
    path: String,
    content: String,
}

#[tauri::command]
fn read_layer_index(dir: String, layer: String) -> Result<Option<LayerIndex>, String> {
    let layer_dir = PathBuf::from(&dir).join(&layer);
    let entries = match std::fs::read_dir(&layer_dir) {
        Ok(entries) => entries,
        Err(_) => return Ok(None),
    };
    for entry in entries.flatten() {
        let name = entry.file_name().to_string_lossy().to_string();
        if name.to_lowercase() == "index.md" {
            let content = std::fs::read_to_string(entry.path()).map_err(|e| e.to_string())?;
            return Ok(Some(LayerIndex {
                path: format!("{}/{}", layer, name),
                content,
            }));
        }
    }
    Ok(None)
}

// ---- AI ----

const DEFAULT_OPENAI: &str = "https://api.openai.com/v1";
const DEFAULT_OPENROUTER: &str = "https://openrouter.ai/api/v1";
const DEFAULT_DEEPSEEK: &str = "https://api.deepseek.com/v1";
const DEFAULT_LOCAL: &str = "http://localhost:11434/v1";

#[derive(serde::Serialize)]
struct AiEnv {
    base_url: String,
    model: String,
    api_key: String,
    source: String,
}

fn env_value(key: &str) -> Option<String> {
    std::env::var(key).ok().filter(|value| !value.trim().is_empty())
}

#[tauri::command]
fn detect_ai_env() -> AiEnv {
    let candidates: [(&str, &str, &str, &str, &str); 4] = [
        ("OPENAI_API_KEY", DEFAULT_OPENAI, "OPENAI_MODEL", "gpt-4o-mini", "OPENAI_BASE_URL"),
        ("OPENROUTER_API_KEY", DEFAULT_OPENROUTER, "OPENROUTER_MODEL", "openai/gpt-4o-mini", "OPENROUTER_BASE_URL"),
        ("DEEPSEEK_API_KEY", DEFAULT_DEEPSEEK, "DEEPSEEK_MODEL", "deepseek-chat", "DEEPSEEK_BASE_URL"),
        ("GROQ_API_KEY", "https://api.groq.com/openai/v1", "GROQ_MODEL", "llama-3.3-70b-versatile", "GROQ_BASE_URL"),
    ];

    for (key_var, default_base, model_var, default_model, base_var) in candidates {
        if let Some(api_key) = env_value(key_var) {
            return AiEnv {
                base_url: env_value(base_var).unwrap_or_else(|| default_base.to_string()),
                model: env_value(model_var).unwrap_or_else(|| default_model.to_string()),
                api_key,
                source: key_var.to_string(),
            };
        }
    }

    AiEnv {
        base_url: env_value("BOARDY_BASE_URL").unwrap_or_else(|| DEFAULT_LOCAL.to_string()),
        model: env_value("BOARDY_MODEL").unwrap_or_else(|| "llama3.1".to_string()),
        api_key: env_value("BOARDY_API_KEY").unwrap_or_else(|| "local".to_string()),
        source: "local".to_string(),
    }
}

#[derive(serde::Serialize, serde::Deserialize)]
struct ChatMessage {
    role: String,
    content: String,
}

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct ChatRequest {
    base_url: String,
    api_key: String,
    model: String,
    messages: Vec<ChatMessage>,
}

fn http_client() -> reqwest::Client {
    reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(120))
        .build()
        .unwrap_or_else(|_| reqwest::Client::new())
}

fn no_auth(key: &str) -> bool {
    let key = key.trim();
    key.is_empty() || key.eq_ignore_ascii_case("local") || key.eq_ignore_ascii_case("ollama")
}

#[tauri::command]
async fn list_models(base: String, key: String) -> Result<Vec<String>, String> {
    let url = format!("{}/models", base.trim_end_matches('/'));
    let mut request = http_client().get(&url);
    if !no_auth(&key) {
        request = request.bearer_auth(&key);
    }
    let response = request
        .send()
        .await
        .map_err(|e| format!("request failed: {e}"))?;

    if !response.status().is_success() {
        return Err(format!("model list failed: HTTP {}", response.status()));
    }

    let json: serde_json::Value = response.json().await.map_err(|e| e.to_string())?;
    let mut models: Vec<String> = json
        .get("data")
        .and_then(|data| data.as_array())
        .map(|items| {
            items
                .iter()
                .filter_map(|item| item.get("id").and_then(|id| id.as_str()).map(|s| s.to_string()))
                .collect()
        })
        .unwrap_or_default();
    models.sort();
    Ok(models)
}

#[derive(serde::Serialize)]
struct ChatReply {
    content: String,
    reasoning: Option<String>,
}

#[tauri::command]
async fn chat(req: ChatRequest) -> Result<ChatReply, String> {
    let url = format!("{}/chat/completions", req.base_url.trim_end_matches('/'));
    let body = serde_json::json!({
        "model": req.model,
        "messages": req.messages,
    });

    let mut request = http_client().post(&url).json(&body);
    if !no_auth(&req.api_key) {
        request = request.bearer_auth(&req.api_key);
    }

    let response = request
        .send()
        .await
        .map_err(|e| format!("request failed: {e}"))?;

    if !response.status().is_success() {
        let status = response.status();
        let text = response.text().await.unwrap_or_default();
        return Err(format!("chat failed: HTTP {status} {text}"));
    }

    let json: serde_json::Value = response.json().await.map_err(|e| e.to_string())?;
    let message = json
        .get("choices")
        .and_then(|choices| choices.get(0))
        .and_then(|choice| choice.get("message"))
        .ok_or_else(|| "response had no message".to_string())?;
    let content = message
        .get("content")
        .and_then(|value| value.as_str())
        .unwrap_or("")
        .to_string();
    let reasoning = message
        .get("reasoning_content")
        .and_then(|value| value.as_str())
        .map(|value| value.to_string());
    Ok(ChatReply { content, reasoning })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            load_boardy,
            save_note,
            move_note,
            delete_note,
            read_layer_index,
            detect_ai_env,
            list_models,
            chat
        ])
        .run(tauri::generate_context!())
        .expect("error while running boardy Studio");
}
