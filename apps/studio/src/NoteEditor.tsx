import { useState } from "react";
import { Button, Group, Textarea, Text } from "@mantine/core";
import type { Note } from "@boardy/core";

export function NoteEditor({
  note,
  onSave,
}: {
  note: Note;
  onSave: (content: string) => Promise<void>;
}) {
  const [value, setValue] = useState(note.raw);
  const [saving, setSaving] = useState(false);

  return (
    <div>
      <Text size="sm" c="dimmed" mb="xs">
        {note.id}
      </Text>
      <Textarea
        value={value}
        onChange={(e) => setValue(e.currentTarget.value)}
        minRows={18}
        autosize
        styles={{ input: { fontFamily: "ui-monospace, monospace", fontSize: 13 } }}
      />
      <Group mt="md" justify="flex-end">
        <Button
          onClick={async () => {
            setSaving(true);
            await onSave(value);
            setSaving(false);
          }}
          loading={saving}
        >
          Save
        </Button>
      </Group>
    </div>
  );
}
