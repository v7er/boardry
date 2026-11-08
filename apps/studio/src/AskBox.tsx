import { useState } from "react";
import { Box, Paper, Stack, Text, TextInput } from "@mantine/core";
import type { BuildResult } from "@boardy/core";

export function AskBox({
  result,
  onOpen,
}: {
  result: BuildResult;
  onOpen: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [asked, setAsked] = useState("");

  const hits = asked.trim()
    ? result.search.search(asked, { prefix: true, boost: { title: 2 } }).slice(0, 4)
    : [];

  return (
    <Paper p="xs" withBorder shadow="sm" style={{ width: 260 }}>
      <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={4}>
        Ask
      </Text>
      <TextInput
        size="xs"
        placeholder="Ask about this project, press Enter"
        value={query}
        onChange={(event) => setQuery(event.currentTarget.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") setAsked(query);
        }}
      />
      {asked && (
        <Stack gap={6} mt={6}>
          {hits.map((hit) => {
            const note = result.notes.find((item) => item.id === hit.id);
            if (!note) return null;
            return (
              <Box key={hit.id} onClick={() => onOpen(hit.id)} style={{ cursor: "pointer" }}>
                <Text size="xs" fw={600} truncate>
                  {note.title}
                </Text>
                <Text size="xs" c="dimmed">
                  {note.layer ?? "note"}
                </Text>
                {note.links.map((link, index) => (
                  <Text key={`${link.type}-${index}`} size="xs" c="dimmed" truncate>
                    {link.type} &rarr; {link.target}
                  </Text>
                ))}
              </Box>
            );
          })}
          {hits.length === 0 && (
            <Text size="xs" c="dimmed">
              No matches.
            </Text>
          )}
        </Stack>
      )}
    </Paper>
  );
}
