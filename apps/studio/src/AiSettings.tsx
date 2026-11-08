import { useEffect, useState } from "react";
import { Autocomplete, Button, Drawer, Group, Stack, Text, TextInput } from "@mantine/core";
import { detectAiEnv, listModels, type AiSettings } from "./ai";

export function AiSettingsDrawer({
  opened,
  onClose,
  settings,
  onSave,
}: {
  opened: boolean;
  onClose: () => void;
  settings: AiSettings | null;
  onSave: (settings: AiSettings) => void;
}) {
  const [baseUrl, setBaseUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("");
  const [models, setModels] = useState<string[]>([]);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!opened) return;
    let cancelled = false;
    (async () => {
      let base = settings?.baseUrl ?? "";
      let key = settings?.apiKey ?? "";
      let mdl = settings?.model ?? "";
      setStatus("");
      if (!base) {
        try {
          const env = await detectAiEnv();
          if (cancelled) return;
          base = env.base_url;
          key = env.api_key;
          mdl = env.model;
          setStatus(`Auto-detected from ${env.source}`);
        } catch {
          // no env detected; leave the fields empty
        }
      }
      setBaseUrl(base);
      setApiKey(key);
      setModel(mdl);
      if (base) {
        try {
          const list = await listModels(base, key);
          if (!cancelled) {
            setModels(list);
            setStatus((prev) => prev || `${list.length} models available`);
          }
        } catch (e) {
          if (!cancelled) setStatus(String(e));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [opened, settings]);

  const fetchModels = async () => {
    setBusy(true);
    try {
      const list = await listModels(baseUrl, apiKey);
      setModels(list);
      setStatus(`${list.length} models available`);
    } catch (e) {
      setStatus(String(e));
    } finally {
      setBusy(false);
    }
  };

  const autoFill = async () => {
    setBusy(true);
    try {
      const env = await detectAiEnv();
      setBaseUrl(env.base_url);
      setApiKey(env.api_key);
      setModel(env.model);
      setStatus(`Auto-filled from ${env.source}`);
      try {
        const list = await listModels(env.base_url, env.api_key);
        setModels(list);
      } catch {
        // keep the manual model
      }
    } catch (e) {
      setStatus(String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Drawer opened={opened} onClose={onClose} position="right" size="md" title="AI settings">
      <Stack>
        <Text size="sm" c="dimmed">
          Reads provider env vars from your machine (OPENAI_API_KEY, OPENROUTER_API_KEY, DEEPSEEK_API_KEY, GROQ_API_KEY).
        </Text>
        <TextInput
          label="Base URL"
          placeholder="https://api.openai.com/v1"
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.currentTarget.value)}
        />
        <TextInput
          label="API key"
          placeholder="sk-..."
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.currentTarget.value)}
        />
        <Autocomplete
          label="Model"
          placeholder="gpt-4o-mini"
          data={models}
          value={model}
          onChange={setModel}
          limit={30}
        />
        <Group>
          <Button variant="light" onClick={autoFill} loading={busy}>
            Auto-fill from env
          </Button>
          <Button variant="light" onClick={fetchModels} loading={busy} disabled={!baseUrl}>
            Fetch models
          </Button>
        </Group>
        {status && (
          <Text size="sm" c="dimmed">
            {status}
          </Text>
        )}
        <Button
          onClick={() => {
            onSave({ baseUrl, apiKey, model });
            onClose();
          }}
          disabled={!baseUrl || !model}
        >
          Save
        </Button>
      </Stack>
    </Drawer>
  );
}
