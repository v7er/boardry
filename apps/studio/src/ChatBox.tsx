import { useState } from "react";
import { Button, Drawer, Group, Loader, ScrollArea, Stack, Text, Textarea } from "@mantine/core";
import { chat, type AiSettings, type ChatMessage } from "./ai";
import type { BuildResult } from "@boardy/core";

interface UiMessage {
  role: "user" | "assistant";
  content: string;
  reasoning?: string | null;
}

function buildContext(result: BuildResult, prompt: string): string {
  const hits = result.search.search(prompt, { prefix: true }).slice(0, 5);
  const parts: string[] = [];
  for (const hit of hits) {
    const note = result.notes.find((n) => n.id === hit.id);
    if (!note) continue;
    parts.push(`## ${note.title} (${note.layer ?? "note"})\n${note.body.slice(0, 700)}`);
  }
  return parts.join("\n\n");
}

export function ChatBox({
  opened,
  onClose,
  settings,
  result,
  onOpenSettings,
}: {
  opened: boolean;
  onClose: () => void;
  settings: AiSettings | null;
  result: BuildResult | null;
  onOpenSettings: () => void;
}) {
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const send = async () => {
    if (!settings || !input.trim()) return;
    const prompt = input.trim();
    setInput("");
    setError("");
    const next: UiMessage[] = [...messages, { role: "user", content: prompt }];
    setMessages(next);
    setSending(true);
    try {
      const context = result ? buildContext(result, prompt) : "";
      const payload: ChatMessage[] = [
        {
          role: "system",
          content:
            "You are the assistant inside boardy Studio. Answer from the project's .boardy notes when possible, and say when a note does not cover it. Be concise.",
        },
        ...(context ? [{ role: "system" as const, content: `Relevant notes:\n\n${context}` }] : []),
        ...next.map((m) => ({ role: m.role, content: m.content })),
      ];
      const reply = await chat(settings, payload);
      setMessages([
        ...next,
        { role: "assistant", content: reply.content, reasoning: reply.reasoning },
      ]);
    } catch (e) {
      setError(String(e));
    } finally {
      setSending(false);
    }
  };

  return (
    <Drawer opened={opened} onClose={onClose} position="right" size="lg" title="AI chat">
      {!settings ? (
        <Stack>
          <Text c="dimmed">Configure the AI provider first.</Text>
          <Button onClick={onOpenSettings}>Open AI settings</Button>
        </Stack>
      ) : (
        <Stack>
          <ScrollArea h={440} type="auto">
            <Stack>
              {messages.length === 0 && (
                <Text c="dimmed" size="sm">
                  Ask anything about the project. The top matching notes are sent as context.
                </Text>
              )}
              {messages.map((message, index) => (
                <div key={index}>
                  <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                    <b>{message.role === "user" ? "You" : "AI"}:</b> {message.content}
                  </Text>
                  {message.reasoning && (
                    <details style={{ marginTop: 4 }}>
                      <summary
                        style={{
                          cursor: "pointer",
                          fontSize: 12,
                          color: "var(--mantine-color-dimmed)",
                        }}
                      >
                        Reasoning
                      </summary>
                      <Text
                        size="xs"
                        c="dimmed"
                        style={{ whiteSpace: "pre-wrap", marginTop: 4 }}
                      >
                        {message.reasoning}
                      </Text>
                    </details>
                  )}
                </div>
              ))}
              {sending && (
                <Group gap="xs">
                  <Loader size="xs" type="dots" />
                  <Text size="sm" c="dimmed">
                    Thinking…
                  </Text>
                </Group>
              )}
            </Stack>
          </ScrollArea>
          {error && (
            <Text c="red" size="sm">
              {error}
            </Text>
          )}
          <Textarea
            value={input}
            onChange={(e) => setInput(e.currentTarget.value)}
            placeholder="Ask about the project..."
            autosize
            minRows={2}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send();
            }}
          />
          <Group justify="space-between">
            <Text size="xs" c="dimmed">
              Cmd/Ctrl + Enter to send
            </Text>
            <Button onClick={send} loading={sending} disabled={!input.trim()}>
              Send
            </Button>
          </Group>
        </Stack>
      )}
    </Drawer>
  );
}
