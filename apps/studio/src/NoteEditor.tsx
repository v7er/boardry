import { useMemo, useState } from "react";
import { Button, Group, Text } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import type { BuildResult, Note } from "@boardry/core";
import { joinNote, splitNote } from "./note";
import { MetadataPanel } from "./MetadataPanel";
import { MarkdownEditor } from "./MarkdownEditor";

export function NoteEditor({
  note,
  result,
  onSave,
  onOpen,
  onDelete,
}: {
  note: Note;
  result: BuildResult;
  onSave: (content: string) => Promise<void>;
  onOpen: (id: string) => void;
  onDelete: () => void;
}) {
  const parsed = useMemo(() => splitNote(note.raw), [note.raw]);
  const [body, setBody] = useState(parsed.body);
  const [saving, setSaving] = useState(false);
  const dirty = body !== parsed.body;

  return (
    <>
      <MetadataPanel
        frontmatter={parsed.frontmatter}
        wikilinks={parsed.wikilinks}
        raw={parsed.frontmatterText}
        result={result}
        onOpen={onOpen}
        onSaveRaw={async (raw) => {
          await onSave(joinNote(raw, body));
        }}
      />
      <Text size="xs" c="dimmed" mt="sm" mb={4}>
        {note.id}
      </Text>
      <MarkdownEditor key={note.id} value={body} onChange={setBody} />
      <Group justify="space-between" mt="sm">
        <Button
          size="xs"
          color="red"
          variant="light"
          leftSection={<IconTrash size={14} />}
          onClick={onDelete}
        >
          Delete
        </Button>
        <Group gap="xs">
          <Text size="xs" c="dimmed">
            {dirty ? "unsaved" : "saved"}
          </Text>
          <Button
            size="xs"
            onClick={async () => {
              setSaving(true);
              try {
                await onSave(joinNote(parsed.frontmatterText, body));
              } finally {
                setSaving(false);
              }
            }}
            loading={saving}
            disabled={!dirty}
          >
            Save
          </Button>
        </Group>
      </Group>
    </>
  );
}
