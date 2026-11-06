import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActionIcon,
  AppShell,
  Box,
  Button,
  Drawer,
  Group,
  Loader,
  Text,
  TextInput,
  Title,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconFolderOpen, IconMoon, IconSearch, IconSun } from "@tabler/icons-react";
import { open } from "@tauri-apps/plugin-dialog";
import type { BuildResult } from "@boardy/core";
import { loadBoardy, saveNote } from "./boardy";
import { GraphView } from "./GraphView";
import { NoteEditor } from "./NoteEditor";
import { CommandPalette } from "./CommandPalette";

function signature(result: BuildResult): string {
  return result.notes.map((n) => `${n.id}\u0001${n.raw}`).join("\u0000");
}

export default function App() {
  const [folder, setFolder] = useState("");
  const [pathInput, setPathInput] = useState("");
  const [result, setResult] = useState<BuildResult | null>(null);
  const [boardyDir, setBoardyDir] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [paletteOpen, { open: openPalette, close: closePalette }] = useDisclosure(false);
  const lastSig = useRef("");
  const { setColorScheme } = useMantineColorScheme();
  const computed = useComputedColorScheme("light");

  const load = useCallback(async (folderPath: string) => {
    if (!folderPath.trim()) return;
    setLoading(true);
    setError("");
    try {
      const loaded = await loadBoardy(folderPath);
      if (!loaded) {
        setError("No .boardy/ folder found in that folder.");
        setResult(null);
      } else {
        setBoardyDir(loaded.boardyDir);
        setResult(loaded.result);
        lastSig.current = signature(loaded.result);
        setFolder(folderPath);
      }
    } catch (e) {
      setError(String(e));
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const openFolder = useCallback(async () => {
    const selected = await open({ directory: true, multiple: false });
    if (typeof selected === "string") {
      setPathInput(selected);
      await load(selected);
    }
  }, [load]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openPalette();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openPalette]);

  // Auto-refresh: poll the folder and reload only when the notes change.
  useEffect(() => {
    if (!folder) return;
    let cancelled = false;
    const tick = async () => {
      const loaded = await loadBoardy(folder);
      if (cancelled || !loaded) return;
      const sig = signature(loaded.result);
      if (sig === lastSig.current) return;
      lastSig.current = sig;
      setBoardyDir(loaded.boardyDir);
      setResult(loaded.result);
    };
    const id = window.setInterval(tick, 2500);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [folder]);

  const selectedNote = useMemo(
    () => result?.notes.find((n) => n.id === selectedId) ?? null,
    [result, selectedId],
  );

  return (
    <AppShell header={{ height: 56 }} padding={0}>
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between" wrap="nowrap">
          <Group gap="xs" wrap="nowrap">
            <Title order={4}>boardy</Title>
            <Button
              variant="subtle"
              leftSection={<IconFolderOpen size={16} />}
              onClick={openFolder}
            >
              Open folder
            </Button>
          </Group>
          <Group gap="xs" wrap="nowrap" style={{ flex: 1, maxWidth: 560 }}>
            <TextInput
              placeholder="Folder path, or use Open folder"
              value={pathInput}
              onChange={(e) => setPathInput(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") load(pathInput);
              }}
              style={{ flex: 1 }}
            />
            <Button onClick={() => load(pathInput)} disabled={!pathInput.trim()}>
              Load
            </Button>
          </Group>
          <Group gap="xs" wrap="nowrap">
            <Button
              variant="subtle"
              leftSection={<IconSearch size={16} />}
              onClick={openPalette}
            >
              Search
            </Button>
            <ActionIcon
              variant="subtle"
              onClick={() => setColorScheme(computed === "dark" ? "light" : "dark")}
              aria-label="Toggle light or dark theme"
            >
              {computed === "dark" ? <IconSun size={18} /> : <IconMoon size={18} />}
            </ActionIcon>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main>
        {loading && (
          <Box p="lg">
            <Loader />
          </Box>
        )}
        {error && (
          <Text c="red" p="md">
            {error}
          </Text>
        )}
        {result && !loading && (
          <Box style={{ position: "relative", height: "calc(100vh - 56px)" }}>
            <GraphView result={result} onSelect={setSelectedId} />
          </Box>
        )}
        {!result && !loading && !error && (
          <Text p="lg" c="dimmed">
            Open a folder that contains a .boardy/ folder to see the graph.
          </Text>
        )}
      </AppShell.Main>

      <Drawer
        opened={selectedNote !== null}
        onClose={() => setSelectedId(null)}
        position="right"
        size="lg"
        title={selectedNote?.title ?? ""}
      >
        {selectedNote && boardyDir && (
          <NoteEditor
            key={selectedNote.id}
            note={selectedNote}
            onSave={async (content) => {
              await saveNote(boardyDir, selectedNote.path, content);
              await load(folder);
            }}
          />
        )}
      </Drawer>

      {result && (
        <CommandPalette
          opened={paletteOpen}
          onClose={closePalette}
          result={result}
          onSelect={(id) => {
            setSelectedId(id);
            closePalette();
          }}
        />
      )}
    </AppShell>
  );
}
