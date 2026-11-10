import { useMemo, useState } from "react";
import { Box, Paper, Stack, Text, TextInput } from "@mantine/core";
import {
  buildRagContext,
  matchQa,
  parseQaEntry,
  type BuildResult,
  type QaEntry,
} from "@boardy/core";

interface FileEntry {
  path: string;
  content: string;
}

interface Line {
  text: string;
  noteId?: string;
}

const HELP: Line[] = [
  { text: "/ask <question>  context from the notes (unverified)" },
  { text: "/qa <question>   verified answer from questions/" },
  { text: "/find <term>     search note titles and text" },
  { text: "/open <note-id>  open a note" },
  { text: "/help            this list" },
];

export function CommandBox({
  result,
  files,
  onOpen,
}: {
  result: BuildResult;
  files: FileEntry[];
  onOpen: (id: string) => void;
}) {
  const [input, setInput] = useState("");
  const [hint, setHint] = useState("");
  const [lines, setLines] = useState<Line[]>([]);

  const entries = useMemo<QaEntry[]>(
    () =>
      files
        .filter((file) => file.path.startsWith("questions/") && file.path.endsWith(".md"))
        .map((file) => parseQaEntry(file.path, file.content))
        .filter((entry): entry is QaEntry => Boolean(entry)),
    [files],
  );

  const run = (raw: string) => {
    const text = raw.trim();
    if (!text) return;

    if (text === "/" || text === "/help") {
      setHint("");
      setLines(HELP);
      return;
    }

    if (text.startsWith("/qa ")) {
      const query = text.slice(4).trim();
      const match = matchQa(entries, query);
      if (!match) {
        setHint(`No verified answer for "${query}". Try /ask.`);
        setLines([]);
        return;
      }
      setHint("");
      setLines([
        { text: match.entry.answer },
        { text: `verified: ${match.entry.verifiedBy ?? "?"} ${match.entry.verifiedAt ?? ""}` },
        ...match.entry.evidence.map((item) => ({ text: `evidence: ${item}` })),
      ]);
      return;
    }

    if (text.startsWith("/ask ")) {
      const query = text.slice(5).trim();
      const context = buildRagContext(result, query, { budget: 2000 });
      if (context.noCoverage) {
        setHint(`No note covers "${query}".`);
        setLines([]);
        return;
      }
      setHint("");
      setLines(
        context.sources.map((source) => ({
          text: `${source.title} (${source.layer ?? "note"})`,
          noteId: source.noteId,
        })),
      );
      return;
    }

    if (text.startsWith("/find ")) {
      const term = text.slice(6).trim().toLowerCase();
      const hits = result.notes
        .filter((note) => `${note.title} ${note.body}`.toLowerCase().includes(term))
        .slice(0, 6);
      setHint(hits.length === 0 ? `No note matches "${term}".` : "");
      setLines(hits.map((note) => ({ text: note.title, noteId: note.id })));
      return;
    }

    if (text.startsWith("/open ")) {
      const id = text.slice(6).trim();
      const note = result.notes.find(
        (item) => item.id === id || item.id.split("/").pop() === id,
      );
      if (note) {
        onOpen(note.id);
        setInput("");
        setHint("");
        setLines([]);
      } else {
        setHint(`No note "${id}".`);
        setLines([]);
      }
      return;
    }

    setHint("Unknown command. Type /help.");
    setLines([]);
  };

  return (
    <Paper p="xs" withBorder shadow="sm" style={{ width: 280 }}>
      <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={4}>
        Command
      </Text>
      <TextInput
        size="xs"
        placeholder="/ask, /qa, /find, /open, /help"
        value={input}
        onChange={(event) => setInput(event.currentTarget.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            run(input);
            setInput("");
          }
        }}
      />
      {hint && (
        <Text size="xs" c="dimmed" mt={6}>
          {hint}
        </Text>
      )}
      {lines.length > 0 && (
        <Stack gap={4} mt={6}>
          {lines.map((line, index) => (
            <Box
              key={`${line.text}-${index}`}
              onClick={() => line.noteId && onOpen(line.noteId)}
              style={{ cursor: line.noteId ? "pointer" : undefined }}
            >
              <Text size="xs" c={line.noteId ? "blue" : undefined}>
                {line.text}
              </Text>
            </Box>
          ))}
        </Stack>
      )}
    </Paper>
  );
}
