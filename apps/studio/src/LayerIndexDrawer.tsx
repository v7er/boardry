import { useState } from "react";
import { Button, Drawer, Group, Text } from "@mantine/core";
import { MarkdownEditor } from "./MarkdownEditor";

export function LayerIndexDrawer({
  opened,
  layer,
  path,
  initialContent,
  onClose,
  onSave,
}: {
  opened: boolean;
  layer: string;
  path: string;
  initialContent: string;
  onClose: () => void;
  onSave: (content: string) => Promise<void>;
}) {
  const [value, setValue] = useState(initialContent);
  const [saving, setSaving] = useState(false);

  return (
    <Drawer opened={opened} onClose={onClose} position="right" size="md" title={`${layer} layer`}>
      <Text size="xs" c="dimmed" mb="xs">
        {path}
      </Text>
      <MarkdownEditor value={value} onChange={setValue} minHeight={280} />
      <Group justify="flex-end" mt="sm">
        <Button
          size="xs"
          loading={saving}
          disabled={value === initialContent}
          onClick={async () => {
            setSaving(true);
            try {
              await onSave(value);
            } finally {
              setSaving(false);
            }
          }}
        >
          Save
        </Button>
      </Group>
    </Drawer>
  );
}
