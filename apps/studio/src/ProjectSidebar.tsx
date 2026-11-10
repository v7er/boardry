import { ActionIcon, Group, Stack, Text } from "@mantine/core";
import { IconChevronLeft, IconChevronRight, IconPlus, IconX } from "@tabler/icons-react";
import type { Note } from "@boardry/core";
import type { Project } from "./projects";

export function ProjectSidebar({
  projects,
  activeId,
  onAdd,
  onSwitch,
  onRemove,
  collapsed,
  onToggle,
  standalone,
  onOpenNote,
}: {
  projects: Project[];
  activeId: string | null;
  onAdd: () => void;
  onSwitch: (id: string) => void;
  onRemove: (id: string) => void;
  collapsed: boolean;
  onToggle: () => void;
  standalone: Note[];
  onOpenNote: (id: string) => void;
}) {
  if (collapsed) {
    return (
      <aside
        className="boardry-sidebar"
        style={{
          width: 36,
          flexShrink: 0,
          borderRight: "1px solid var(--mantine-color-default-border)",
          padding: 6,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <ActionIcon size="sm" variant="subtle" onClick={onToggle} aria-label="Expand sidebar">
          <IconChevronRight size={16} />
        </ActionIcon>
      </aside>
    );
  }

  return (
    <aside
      className="boardry-sidebar"
      style={{
        width: 220,
        flexShrink: 0,
        borderRight: "1px solid var(--mantine-color-default-border)",
        overflowY: "auto",
        padding: 8,
      }}
    >
      <Group justify="space-between" mb={6} px={4} wrap="nowrap">
        <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
          Projects
        </Text>
        <Group gap={2} wrap="nowrap">
          <ActionIcon size="xs" variant="subtle" onClick={onAdd} aria-label="Add project">
            <IconPlus size={14} />
          </ActionIcon>
          <ActionIcon
            size="xs"
            variant="subtle"
            onClick={onToggle}
            aria-label="Collapse sidebar"
          >
            <IconChevronLeft size={14} />
          </ActionIcon>
        </Group>
      </Group>

      <Stack gap={2}>
        {projects.map((project) => (
          <div
            key={project.id}
            onClick={() => onSwitch(project.id)}
            style={{
              cursor: "pointer",
              padding: "5px 6px",
              borderRadius: 4,
              background:
                project.id === activeId ? "var(--mantine-color-default-hover)" : undefined,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 4,
            }}
          >
            <div style={{ minWidth: 0 }}>
              <Text size="sm" truncate>
                {project.name}
              </Text>
              <Text size="xs" c="dimmed" truncate>
                {project.path}
              </Text>
            </div>
            <ActionIcon
              size="xs"
              variant="subtle"
              color="red"
              onClick={(event) => {
                event.stopPropagation();
                onRemove(project.id);
              }}
              aria-label="Remove project"
            >
              <IconX size={12} />
            </ActionIcon>
          </div>
        ))}
        {projects.length === 0 && (
          <Text size="xs" c="dimmed" px={4}>
            No projects yet. Add one.
          </Text>
        )}
      </Stack>

      {activeId && (
        <>
          <Text size="xs" c="dimmed" tt="uppercase" fw={600} mt="md" mb={4} px={4}>
            Standalone
          </Text>
          <Stack gap={1}>
            {standalone.map((note) => (
              <Text
                key={note.id}
                size="sm"
                truncate
                onClick={() => onOpenNote(note.id)}
                style={{ cursor: "pointer", padding: "3px 6px", borderRadius: 4 }}
              >
                {note.title}
              </Text>
            ))}
            {standalone.length === 0 && (
              <Text size="xs" c="dimmed" px={4}>
                None.
              </Text>
            )}
          </Stack>
        </>
      )}
    </aside>
  );
}
