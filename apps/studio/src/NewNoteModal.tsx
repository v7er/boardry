import { useEffect, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Group,
  Modal,
  Stack,
  Text,
  TextInput,
  useComputedColorScheme,
} from "@mantine/core";
import { saveNote } from "./boardry";
import { MarkdownEditor } from "./MarkdownEditor";

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "note"
  );
}

export function NewNoteModal({
  opened,
  onClose,
  layers,
  boardryDir,
  parentId,
  defaultLayer,
  onCreated,
}: {
  opened: boolean;
  onClose: () => void;
  layers: string[];
  boardryDir: string;
  parentId?: string;
  defaultLayer?: string;
  onCreated: (id: string) => void;
}) {
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [editorKey, setEditorKey] = useState(0);
  const colorScheme = useComputedColorScheme("light");

  const effectiveLayer = defaultLayer ?? layers[0] ?? null;

  useEffect(() => {
    if (!opened) return;
    setName("");
    setContent("");
    setEditorKey((key) => key + 1);
  }, [opened]);

  const create = async () => {
    if (!name.trim() || !effectiveLayer) return;
    setSaving(true);
    try {
      const lines = ["---", `title: ${JSON.stringify(name.trim())}`, `layer: ${effectiveLayer}`];
      if (parentId) {
        lines.push("links:", "  - type: refines", `    target: "[[${parentId}]]"`);
      }
      lines.push("---", "");
      const body = content.trim();
      const note = body ? `${lines.join("\n")}\n${body}\n` : lines.join("\n");
      const path = `${effectiveLayer}/${slugify(name)}.md`;
      await saveNote(boardryDir, path, note);
      setName("");
      setContent("");
      onCreated(path.replace(/\.md$/, ""));
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="New node"
      centered
      styles={{
        header: {
          background:
            colorScheme === "dark"
              ? "var(--mantine-color-dark-5)"
              : "var(--mantine-color-gray-2)",
          minHeight: 0,
          padding: "8px 12px",
        },
        title: { fontSize: 14, fontWeight: 600 },
        body: { padding: "10px 12px 12px" },
      }}
    >
      <Stack gap="xs">
        <Group gap={4} wrap="wrap">
          <Badge size="xs" radius="sm" variant="default">
            layer: {effectiveLayer ?? "none"}
          </Badge>
          {parentId && (
            <Badge size="xs" radius="sm" variant="default">
              refines: {parentId}
            </Badge>
          )}
        </Group>
        <TextInput
          size="xs"
          label="Name"
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          autoFocus
        />
        <div>
          <Text size="xs" fw={500} mb={4}>
            Content (optional)
          </Text>
          <Box
            style={{
              border: "1px solid var(--mantine-color-default-border)",
              borderRadius: 6,
              padding: "2px 8px",
            }}
          >
            <MarkdownEditor
              key={editorKey}
              value={content}
              onChange={setContent}
              minHeight={110}
              toolbar={false}
            />
          </Box>
        </div>
        <Group justify="flex-end" gap="xs">
          <Button size="xs" variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="xs"
            onClick={create}
            loading={saving}
            disabled={!name.trim() || !effectiveLayer}
          >
            Create
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
