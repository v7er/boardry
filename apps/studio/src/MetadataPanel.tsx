import { useEffect, useState } from "react";
import { Badge, Button, Group, Stack, Textarea } from "@mantine/core";
import type { BuildResult } from "@boardry/core";
import { noteTitle, resolveNoteId } from "./note";

function stringValue(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function MetadataPanel({
  frontmatter,
  wikilinks,
  raw,
  result,
  onOpen,
  onSaveRaw,
}: {
  frontmatter: Record<string, unknown>;
  wikilinks: string[];
  raw: string;
  result: BuildResult;
  onOpen: (id: string) => void;
  onSaveRaw: (raw: string) => Promise<void>;
}) {
  const [rawOpen, setRawOpen] = useState(false);
  const [rawValue, setRawValue] = useState(raw);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setRawValue(raw);
  }, [raw]);

  const layer = stringValue(frontmatter.layer);
  const kind = stringValue(frontmatter.kind);
  const component = stringValue(frontmatter.component);
  const tags = Array.isArray(frontmatter.tags)
    ? frontmatter.tags.filter((tag): tag is string => typeof tag === "string")
    : [];

  const links = Array.isArray(frontmatter.links)
    ? (frontmatter.links as { type?: unknown; target?: unknown }[])
        .map((link) => ({
          type: stringValue(link.type) || "relates_to",
          target: stringValue(link.target),
        }))
        .map((link) => ({ ...link, id: resolveNoteId(result, link.target) }))
        .filter((link): link is { type: string; target: string; id: string } => Boolean(link.id))
    : [];

  const wikiLinks = wikilinks
    .map((target) => resolveNoteId(result, target))
    .filter((id): id is string => Boolean(id));

  const hasMetadata = Boolean(layer || kind || component) || tags.length > 0;

  return (
    <Stack gap={6}>
      <Group justify="space-between" wrap="nowrap" align="flex-start">
        {hasMetadata ? (
          <Group gap={4} wrap="wrap">
            {layer && (
              <Badge size="sm" variant="filled">
                {layer}
              </Badge>
            )}
            {kind && (
              <Badge size="sm" variant="light">
                {kind}
              </Badge>
            )}
            {component && (
              <Badge size="sm" variant="outline">
                {component}
              </Badge>
            )}
            {tags.map((tag) => (
              <Badge key={tag} size="sm" variant="dot">
                {tag}
              </Badge>
            ))}
          </Group>
        ) : (
          <span />
        )}
        <Button
          size="compact-xs"
          variant="subtle"
          onClick={() => setRawOpen((value) => !value)}
        >
          {rawOpen ? "Hide raw" : "Raw"}
        </Button>
      </Group>

      {rawOpen && (
        <Stack gap={4}>
          <Textarea
            value={rawValue}
            onChange={(event) => setRawValue(event.currentTarget.value)}
            autosize
            minRows={3}
            styles={{ input: { fontFamily: "ui-monospace, monospace", fontSize: 12 } }}
          />
          <Group justify="flex-end">
            <Button
              size="compact-xs"
              loading={saving}
              disabled={rawValue === raw}
              onClick={async () => {
                setSaving(true);
                try {
                  await onSaveRaw(rawValue);
                } finally {
                  setSaving(false);
                }
              }}
            >
              Save
            </Button>
          </Group>
        </Stack>
      )}

      {(links.length > 0 || wikiLinks.length > 0) && (
        <Group gap={4}>
          {links.map((link) => (
            <Badge
              key={`l-${link.type}-${link.id}`}
              size="sm"
              variant="light"
              style={{ cursor: "pointer" }}
              onClick={() => onOpen(link.id)}
            >
              {link.type} &rarr; {noteTitle(result, link.id)}
            </Badge>
          ))}
          {wikiLinks.map((id) => (
            <Badge
              key={`w-${id}`}
              size="sm"
              variant="outline"
              style={{ cursor: "pointer" }}
              onClick={() => onOpen(id)}
            >
              &larr; {noteTitle(result, id)}
            </Badge>
          ))}
        </Group>
      )}
    </Stack>
  );
}
