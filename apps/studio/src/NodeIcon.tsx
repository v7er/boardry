import { useMemo, useState } from "react";
import { ActionIcon, Group, Popover, SimpleGrid, Stack, TextInput } from "@mantine/core";
import { ICON_COLORS, ICON_NAMES, iconComponent } from "./icons";

export function NodeIcon({
  name,
  color,
  onChange,
}: {
  name: string;
  color: string;
  onChange: (name: string, color: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const Icon = iconComponent(name);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? ICON_NAMES.filter((item) => item.toLowerCase().includes(q)) : ICON_NAMES;
  }, [query]);

  return (
    <Popover opened={open} onChange={setOpen} position="bottom" withArrow shadow="md">
      <Popover.Target>
        <button
          className="nodrag"
          onClick={(event) => {
            event.stopPropagation();
            setOpen((value) => !value);
          }}
          aria-label="Change icon"
          style={{
            width: 22,
            height: 22,
            borderRadius: 6,
            border: "none",
            background: "rgba(255,255,255,0.22)",
            color: "#ffffff",
            cursor: "pointer",
            padding: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon size={14} />
        </button>
      </Popover.Target>
      <Popover.Dropdown p={6}>
        <Stack gap={6} w={196}>
          <TextInput
            size="xs"
            placeholder="Find icon"
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
          />
          <SimpleGrid cols={7} spacing={2}>
            {filtered.map((iconName) => {
              const Item = iconComponent(iconName);
              return (
                <ActionIcon
                  key={iconName}
                  size="sm"
                  variant={iconName === name ? "light" : "subtle"}
                  onClick={() => onChange(iconName, color)}
                  aria-label={iconName}
                >
                  <Item size={14} />
                </ActionIcon>
              );
            })}
          </SimpleGrid>
          <Group gap={4}>
            {ICON_COLORS.map((swatch) => (
              <button
                key={swatch}
                onClick={() => onChange(name, swatch)}
                aria-label={swatch}
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  background: swatch,
                  border: swatch === color ? "2px solid var(--mantine-color-text)" : "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              />
            ))}
          </Group>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}
