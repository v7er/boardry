import { useEffect, useMemo, useState } from "react";
import { Modal, TextInput, List, Text } from "@mantine/core";
import type { BuildResult } from "@boardry/core";

export function CommandPalette({
  opened,
  onClose,
  result,
  onSelect,
}: {
  opened: boolean;
  onClose: () => void;
  result: BuildResult;
  onSelect: (id: string) => void;
}) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (opened) setQuery("");
  }, [opened]);

  const results = useMemo(() => {
    if (!query.trim()) {
      return result.notes.slice(0, 20).map((note) => ({ id: note.id, title: note.title }));
    }
    return result.search
      .search(query, { prefix: true, boost: { title: 2 } })
      .slice(0, 20)
      .map((r) => ({ id: r.id, title: r.title }));
  }, [query, result]);

  return (
    <Modal opened={opened} onClose={onClose} title="Search notes" centered size="lg">
      <TextInput
        autoFocus
        placeholder="Type to search notes"
        value={query}
        onChange={(e) => setQuery(e.currentTarget.value)}
      />
      <List mt="md">
        {results.map((r) => (
          <List.Item
            key={r.id}
            onClick={() => onSelect(r.id)}
            style={{ cursor: "pointer", padding: "6px 0" }}
          >
            <Text size="sm">{r.title}</Text>
          </List.Item>
        ))}
      </List>
      {results.length === 0 && (
        <Text c="dimmed" size="sm" mt="md">
          No matches.
        </Text>
      )}
    </Modal>
  );
}
