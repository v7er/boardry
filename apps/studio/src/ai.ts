import { invoke } from "@tauri-apps/api/core";

export interface AiSettings {
  baseUrl: string;
  apiKey: string;
  model: string;
}

export interface AiEnv {
  base_url: string;
  model: string;
  api_key: string;
  source: string;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatReply {
  content: string;
  reasoning?: string | null;
}

const STORAGE_KEY = "boardy.ai.settings";

export function loadAiSettings(): AiSettings | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AiSettings>;
    if (!parsed.baseUrl || !parsed.model) return null;
    return { baseUrl: parsed.baseUrl, model: parsed.model, apiKey: parsed.apiKey ?? "" };
  } catch {
    return null;
  }
}

export function saveAiSettings(settings: AiSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export async function detectAiEnv(): Promise<AiEnv> {
  return invoke<AiEnv>("detect_ai_env");
}

export async function listModels(baseUrl: string, apiKey: string): Promise<string[]> {
  return invoke<string[]>("list_models", { base: baseUrl, key: apiKey });
}

export async function chat(settings: AiSettings, messages: ChatMessage[]): Promise<ChatReply> {
  return invoke<ChatReply>("chat", {
    req: {
      baseUrl: settings.baseUrl,
      apiKey: settings.apiKey,
      model: settings.model,
      messages,
    },
  });
}
