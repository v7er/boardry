import { useEffect, useMemo, useState } from "react";
import { ActionIcon, Box, Button, Group, ScrollArea, Stack, Text, TextInput } from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import type { BuildResult } from "@boardy/core";
import { joinNote, splitNote } from "./note";
import { MetadataPanel } from "./MetadataPanel";
import { MarkdownEditor } from "./MarkdownEditor";

interface FileEntry {
  path: string;
  content: string;
}

function baseName(path: string): string {
  return path.split("/").pop() ?? path;
}

function isIndexPath(path: string): boolean {
  return baseName(path).toLowerCase() === "index.md";
}

export function IdeView({
  result,
  files,
  onSave,
  onDelete,
  onMove,
}: {
  result: BuildResult;
  files: FileEntry[];
  onSave: (path: string, content: string) => Promise<void>;
  onDelete: (id: string) => void;
  onMove: (from: string, toDir: string) => Promise<void>;
}) {
  const [selectedPath, setSelectedPath] = useState<string | null>(files[0]?.path ?? null);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [creatingDir, setCreatingDir] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [dragOverDir, setDragOverDir] = useState<string | null>(null);

  const selected = useMemo(
    () => files.find((file) => file.path === selectedPath) ?? null,
    [files, selectedPath],
  );

  const indexFile = selected ? isIndexPath(selected.path) : false;
  const parsed = useMemo(
    () => (selected && !indexFile ? splitNote(selected.content) : null),
    [selected, indexFile],
  );

  const initial = selected ? (indexFile ? selected.content : parsed?.body ?? "") : "";

  useEffect(() => {
    setDraft(initial);
    // Reset the buffer only when the selected file changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPath]);

  const groups = useMemo(() => {
    const map = new Map<string, FileEntry[]>();
    for (const file of files) {
      const slash = file.path.lastIndexOf("/");
      const dir = slash === -1 ? "" : file.path.slice(0, slash);
      if (!map.has(dir)) map.set(dir, []);
      map.get(dir)!.push(file);
    }
    return [...map.entries()].sort(([a], [b]) =>
      a === "" ? -1 : b === "" ? 1 : a.localeCompare(b),
    );
  }, [files]);

  const dirty = selected ? draft !== initial : false;

  const startCreate = (dir: string) => {
    setCreatingDir(dir);
    setNewName("");
  };

  const cancelCreate = () => {
    setCreatingDir(null);
    setNewName("");
  };

  const createFile = async (dir: string) => {
    const name = newName.trim();
    if (!name || creating) return;
    const slug =
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "note";
    const path = dir ? `${dir}/${slug}.md` : `${slug}.md`;
    if (files.some((file) => file.path === path)) {
      setSelectedPath(path);
      cancelCreate();
      return;
    }
    const content = result.layers.includes(dir)
      ? `---\ntitle: ${JSON.stringify(name)}\nlayer: ${dir}\n---\n\n## Summary\n\n`
      : `---\ntitle: ${JSON.stringify(name)}\n---\n\n## Summary\n\n`;
    setCreating(true);
    try {
      await onSave(path, content);
      setSelectedPath(path);
      cancelCreate();
    } finally {
      setCreating(false);
    }
  };

  const save = async () => {
    if (!selected) return;
    const content = indexFile ? draft : joinNote(parsed?.frontmatterText ?? "", draft);
    setSaving(true);
    try {
      await onSave(selected.path, content);
    } finally {
      setSaving(false);
    }
  };

  const selectedNote = selected
    ? result.notes.find((note) => note.id === selected.path.replace(/\.md$/, ""))
    : null;

  return (
    <Group align="stretch" gap={0} wrap="nowrap" style={{ height: "calc(100vh - 56px)" }}>
      <Box
        w={240}
        className="boardy-sidebar"
        style={{
          borderRight: "1px solid var(--mantine-color-default-border)",
          overflow: "hidden",
        }}
      >
        <ScrollArea h="100%" p="xs">
          {groups.map(([dir, entries]) => (
            <div key={dir || "(root)"} style={{ marginBottom: 14 }}>
              <Group
                justify="space-between"
                wrap="nowrap"
                mb={4}
                px={4}
                py={2}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragOverDir(dir);
                }}
                onDragLeave={() =>
                  setDragOverDir((current) => (current === dir ? null : current))
                }
                onDrop={(event) => {
                  event.preventDefault();
                  setDragOverDir(null);
                  const from = event.dataTransfer.getData("text/plain");
                  if (from) void onMove(from, dir);
                }}
                style={{
                  borderRadius: 4,
                  background: dragOverDir === dir ? "rgba(250, 204, 21, 0.14)" : undefined,
                }}
              >
                <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                  {dir || "root"}
                </Text>
                <ActionIcon
                  size="xs"
                  variant="subtle"
                  onClick={() => startCreate(dir)}
                  aria-label="New file"
                >
                  <IconPlus size={12} />
                </ActionIcon>
              </Group>
              <Stack gap={2}>
                {entries.map((file) => {
                  const name = baseName(file.path);
                  const label = name.replace(/\.md$/, "");
                  return (
                    <Text
                      key={file.path}
                      size="sm"
                      draggable
                      onDragStart={(event) => {
                        event.dataTransfer.setData("text/plain", file.path);
                        event.dataTransfer.effectAllowed = "move";
                      }}
                      onClick={() => setSelectedPath(file.path)}
                      style={{
                        cursor: "pointer",
                        padding: "4px 6px",
                        borderRadius: 4,
                        fontStyle: name.toLowerCase() === "index.md" ? "italic" : undefined,
                        background:
                          file.path === selectedPath
                            ? "var(--mantine-color-default-hover)"
                            : undefined,
                      }}
                    >
                      {label}
                    </Text>
                  );
                })}
                {creatingDir === dir && (
                  <TextInput
                    size="xs"
                    autoFocus
                    value={newName}
                    placeholder="file name"
                    rightSection={
                      <Text size="xs" c="dimmed">
                        .md
                      </Text>
                    }
                    rightSectionWidth={30}
                    onChange={(event) => setNewName(event.currentTarget.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") void createFile(dir);
                      if (event.key === "Escape") cancelCreate();
                    }}
                    onBlur={cancelCreate}
                    styles={{ input: { fontSize: 12 } }}
                  />
                )}
              </Stack>
            </div>
          ))}
        </ScrollArea>
      </Box>

      <Box style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {selected ? (
          <>
            <Group
              justify="space-between"
              px="sm"
              py="xs"
              style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}
            >
              <Text size="xs" c="dimmed">
                {selected.path}
              </Text>
              <Group gap="xs">
                {dirty && (
                  <Text size="xs" c="yellow">
                    unsaved
                  </Text>
                )}
                {selectedNote && (
                  <Button
                    size="xs"
                    color="red"
                    variant="light"
                    leftSection={<IconTrash size={14} />}
                    onClick={() => onDelete(selectedNote.id)}
                  >
                    Delete
                  </Button>
                )}
                <Button size="xs" onClick={save} loading={saving} disabled={!dirty}>
                  Save
                </Button>
              </Group>
            </Group>
            {!indexFile && parsed && (
              <Box
                p="sm"
                style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}
              >
                <MetadataPanel
                  frontmatter={parsed.frontmatter}
                  wikilinks={parsed.wikilinks}
                  raw={parsed.frontmatterText}
                  result={result}
                  onOpen={(id) => {
                    const target = files.find((file) => file.path === `${id}.md`);
                    if (target) setSelectedPath(target.path);
                  }}
                  onSaveRaw={async (raw) => {
                    await onSave(selected.path, joinNote(raw, draft));
                  }}
                />
              </Box>
            )}
            <Box style={{ flex: 1, overflow: "auto" }} p="sm">
              <MarkdownEditor key={selected.path} value={draft} onChange={setDraft} minHeight={400} />
            </Box>
          </>
        ) : (
          <Text p="md" c="dimmed">
            Select a file from the tree.
          </Text>
        )}
      </Box>
    </Group>
  );
}
