import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActionIcon,
  AppShell,
  Box,
  Button,
  Drawer,
  Group,
  Loader,
  Modal,
  SegmentedControl,
  Text,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconMoon, IconSearch, IconSun } from "@tabler/icons-react";
import { open } from "@tauri-apps/plugin-dialog";
import { updateFrontmatter, type BuildResult } from "@boardry/core";
import { deleteNote, loadBoardry, moveNote, readLayerIndex, saveNote, setLayer } from "./boardry";
import { loadAiSettings, saveAiSettings, type AiSettings } from "./ai";
import { loadProjects, newProject, saveProjects, type Project } from "./projects";
import { ProjectSidebar } from "./ProjectSidebar";
import { GraphView } from "./GraphView";
import { NoteEditor } from "./NoteEditor";
import { CommandPalette } from "./CommandPalette";
import { AiSettingsDrawer } from "./AiSettings";
import { ChatBox } from "./ChatBox";
import { IdeView } from "./IdeView";
import { LayerIndexDrawer } from "./LayerIndexDrawer";
import { NewNoteModal } from "./NewNoteModal";
import logo from "./assets/logo.png";

function signature(result: BuildResult): string {
  return result.notes.map((n) => `${n.id}\u0001${n.raw}`).join("\u0000");
}

interface CachedProject {
  result: BuildResult;
  boardryDir: string;
  files: { path: string; content: string }[];
}

export default function App() {
  const [projects, setProjects] = useState<Project[]>(() => loadProjects());
  const [activeId, setActiveId] = useState<string | null>(() => loadProjects()[0]?.id ?? null);
  const [cache, setCache] = useState<Record<string, CachedProject>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<"graph" | "ide">("graph");
  const [paletteOpen, { open: openPalette, close: closePalette }] = useDisclosure(false);
  const [aiSettings, setAiSettings] = useState<AiSettings | null>(() => loadAiSettings());
  const [aiOpen, { open: openAi, close: closeAi }] = useDisclosure(false);
  const [chatOpen, { open: openChat, close: closeChat }] = useDisclosure(false);
  const [newNoteOpen, { open: openNewNote, close: closeNewNote }] = useDisclosure(false);
  const [newNoteParent, setNewNoteParent] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [layerIndex, setLayerIndex] = useState<{
    layer: string;
    path: string;
    content: string;
  } | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { setColorScheme } = useMantineColorScheme();
  const computed = useComputedColorScheme("light");
  const lastSig = useRef<Record<string, string>>({});

  const active = useMemo(
    () => projects.find((project) => project.id === activeId) ?? null,
    [projects, activeId],
  );
  const cached = active ? cache[active.id] : undefined;
  const result = cached?.result ?? null;
  const boardryDir = cached?.boardryDir ?? "";
  const files = cached?.files ?? [];

  const standalone = useMemo(() => {
    if (!result) return [];
    const graph = result.graph.graph;
    const connected = new Set<string>();
    for (const edge of graph.export().edges) {
      const label = String(edge.attributes?.label ?? "");
      if (label === "refines" || label === "part_of") {
        connected.add(edge.source);
        connected.add(edge.target);
      }
    }
    return result.notes.filter((note) => !connected.has(note.id));
  }, [result]);

  const loadInto = useCallback(async (project: Project, silent = false) => {
    if (!silent) setLoading(true);
    setError("");
    try {
      const loaded = await loadBoardry(project.path);
      if (!loaded) {
        setError("No .boardry/ folder found in that folder.");
        return;
      }
      setCache((prev) => ({
        ...prev,
        [project.id]: {
          result: loaded.result,
          boardryDir: loaded.boardryDir,
          files: loaded.files,
        },
      }));
      lastSig.current[project.id] = signature(loaded.result);
    } catch (e) {
      setError(String(e));
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!active) return;
    if (!cache[active.id]) void loadInto(active);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  // Auto-refresh the active project.
  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    const tick = async () => {
      const loaded = await loadBoardry(active.path);
      if (cancelled || !loaded) return;
      const sig = signature(loaded.result);
      if (sig === lastSig.current[active.id]) return;
      lastSig.current[active.id] = sig;
      setCache((prev) => ({
        ...prev,
        [active.id]: {
          result: loaded.result,
          boardryDir: loaded.boardryDir,
          files: loaded.files,
        },
      }));
    };
    const id = window.setInterval(tick, 2500);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [active]);

  const addProjectPath = useCallback(
    (value: string) => {
      if (!value.trim()) return;
      const project = newProject(value.trim());
      const existing = projects.find((p) => p.path === project.path);
      if (existing) {
        setActiveId(existing.id);
        return;
      }
      setProjects((prev) => {
        const next = [...prev, project];
        saveProjects(next);
        return next;
      });
      setActiveId(project.id);
      setSelectedId(null);
    },
    [projects],
  );

  const addProject = useCallback(async () => {
    const selected = await open({ directory: true, multiple: false });
    if (typeof selected === "string") addProjectPath(selected);
  }, [addProjectPath]);

  const removeProject = useCallback(
    (id: string) => {
      setProjects((prev) => {
        const next = prev.filter((project) => project.id !== id);
        saveProjects(next);
        return next;
      });
      setCache((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setActiveId((current) =>
        current === id ? projects.find((project) => project.id !== id)?.id ?? null : current,
      );
    },
    [projects],
  );

  const switchProject = useCallback((id: string) => {
    setActiveId(id);
    setSelectedId(null);
  }, []);

  const reloadActive = useCallback(async () => {
    if (active) await loadInto(active, true);
  }, [active, loadInto]);

  const setIcon = useCallback(
    async (id: string, name: string, color: string) => {
      if (!result || !boardryDir) return;
      const note = result.notes.find((item) => item.id === id);
      if (!note) return;
      const content = updateFrontmatter(note.raw, { icon: { name, color } });
      await saveNote(boardryDir, note.path, content);
      await reloadActive();
    },
    [result, boardryDir, reloadActive],
  );

  const openLayer = useCallback(
    async (layer: string) => {
      const found = await readLayerIndex(boardryDir, layer);
      setLayerIndex(
        found
          ? { layer, path: found.path, content: found.content }
          : { layer, path: `${layer}/index.md`, content: "" },
      );
    },
    [boardryDir],
  );

  const saveLayer = useCallback(
    async (content: string) => {
      if (!layerIndex) return;
      await saveNote(boardryDir, layerIndex.path, content);
      setLayerIndex({ ...layerIndex, content });
    },
    [layerIndex, boardryDir],
  );

  const moveFile = useCallback(
    async (from: string, toDir: string) => {
      if (!boardryDir) return;
      const filename = from.split("/").pop() ?? from;
      const to = toDir ? `${toDir}/${filename}` : filename;
      if (to === from) return;
      const source = files.find((file) => file.path === from);
      if (!source) return;
      const isLayer = result?.layers.includes(toDir) ?? false;
      const content = isLayer ? setLayer(source.content, toDir) : source.content;
      await moveNote(boardryDir, from, to, content);
      await reloadActive();
    },
    [boardryDir, files, result, reloadActive],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openPalette();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openPalette]);

  const selectedNote = useMemo(
    () => result?.notes.find((n) => n.id === selectedId) ?? null,
    [result, selectedId],
  );

  const ancestorChain = useMemo(() => {
    if (!result || !selectedId) return [];
    const graph = result.graph.graph;
    const chain: string[] = [];
    const seen = new Set<string>();
    let current: string | undefined = selectedId;
    while (current && !seen.has(current)) {
      seen.add(current);
      chain.unshift(current);
      const parentEdge: string | undefined = graph.outEdges(current).find((edge) => {
        const label = String(graph.getEdgeAttribute(edge, "label") ?? "");
        return label === "refines" || label === "part_of";
      });
      current = parentEdge ? graph.target(parentEdge) : undefined;
    }
    return chain;
  }, [result, selectedId]);

  const deleteTargetNote = useMemo(
    () => (deleteTarget ? result?.notes.find((n) => n.id === deleteTarget) ?? null : null),
    [deleteTarget, result],
  );

  const confirmDelete = useCallback(async () => {
    if (!deleteTargetNote || !boardryDir) return;
    await deleteNote(boardryDir, deleteTargetNote.path);
    setDeleteTarget(null);
    setSelectedId(null);
    await reloadActive();
  }, [deleteTargetNote, boardryDir, reloadActive]);

  const openNewNoteFor = useCallback(
    (parentId: string | null) => {
      setNewNoteParent(parentId);
      openNewNote();
    },
    [openNewNote],
  );

  const newNoteParentNote = useMemo(
    () => (newNoteParent ? result?.notes.find((n) => n.id === newNoteParent) ?? null : null),
    [newNoteParent, result],
  );

  const newNoteDefaultLayer = useMemo(() => {
    if (!result || !newNoteParentNote) return undefined;
    const layer = newNoteParentNote.layer;
    return layer && result.layers.includes(layer) ? layer : result.layers[0];
  }, [result, newNoteParentNote]);

  return (
    <AppShell header={{ height: 56 }} padding={0}>
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between" wrap="nowrap">
          <Group gap="xs" wrap="nowrap">
            <img
              src={logo}
              alt="boardry"
              height={28}
              draggable={false}
              style={{ borderRadius: 6, display: "block" }}
            />
            <SegmentedControl
              size="xs"
              value={view}
              onChange={(value) => setView(value as "graph" | "ide")}
              data={[
                { label: "Graph", value: "graph" },
                { label: "IDE", value: "ide" },
              ]}
            />
          </Group>
          <Group gap="xs" wrap="nowrap">
            <Button variant="subtle" size="compact-sm" onClick={openChat}>
              Chat
            </Button>
            <Button variant="subtle" size="compact-sm" onClick={openAi}>
              AI
            </Button>
            <Button
              variant="subtle"
              size="compact-sm"
              leftSection={<IconSearch size={16} />}
              onClick={openPalette}
              disabled={!result}
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
        <Group align="stretch" gap={0} wrap="nowrap" style={{ height: "calc(100vh - 56px)" }}>
          <ProjectSidebar
            projects={projects}
            activeId={activeId}
            onAdd={addProject}
            onSwitch={switchProject}
            onRemove={removeProject}
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed((value) => !value)}
            standalone={standalone}
            onOpenNote={setSelectedId}
          />
          <Box style={{ flex: 1, position: "relative", minWidth: 0, overflow: "hidden" }}>
            {!active && (
              <Text p="lg" c="dimmed">
                Add a project folder to start. Pick either the project root or the .boardry folder.
              </Text>
            )}
            {active && !result && !error && (
              <Box p="lg">
                <Loader />
              </Box>
            )}
            {error && (
              <Text c="red" p="md">
                {error}
              </Text>
            )}
            {result && !loading && view === "graph" && (
              <GraphView
                result={result}
                boardryDir={boardryDir}
                files={files}
                onSelect={setSelectedId}
                onCreateChild={(id) => openNewNoteFor(id)}
                onMoved={reloadActive}
                onLayerClick={openLayer}
                onSetIcon={setIcon}
              />
            )}
            {result && !loading && view === "ide" && (
              <IdeView
                result={result}
                files={files}
                onSave={async (path, content) => {
                  await saveNote(boardryDir, path, content);
                  await reloadActive();
                }}
                onDelete={setDeleteTarget}
                onMove={moveFile}
              />
            )}
          </Box>
        </Group>
      </AppShell.Main>

      <Drawer
        opened={selectedNote !== null}
        onClose={() => setSelectedId(null)}
        position="right"
        size="lg"
        title={
          <Text size="sm" fw={600} c="dimmed">
            {selectedNote?.title ?? ""}
          </Text>
        }
      >
        {ancestorChain.length > 1 && (
          <Group gap={4} mb="sm" wrap="wrap">
            {ancestorChain.map((id, index) => (
              <Group key={id} gap={4} wrap="nowrap">
                {index > 0 && (
                  <Text size="xs" c="dimmed">
                    /
                  </Text>
                )}
                <Text
                  size="xs"
                  c={id === selectedId ? undefined : "blue"}
                  style={{ cursor: "pointer" }}
                  onClick={() => setSelectedId(id)}
                >
                  {result?.notes.find((n) => n.id === id)?.title ?? id}
                </Text>
              </Group>
            ))}
          </Group>
        )}
        {selectedNote && boardryDir && result && (
          <NoteEditor
            key={selectedNote.id}
            note={selectedNote}
            result={result}
            onOpen={setSelectedId}
            onDelete={() => setDeleteTarget(selectedNote.id)}
            onSave={async (content) => {
              await saveNote(boardryDir, selectedNote.path, content);
              await reloadActive();
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

      <AiSettingsDrawer
        opened={aiOpen}
        onClose={closeAi}
        settings={aiSettings}
        onSave={(next) => {
          saveAiSettings(next);
          setAiSettings(next);
        }}
      />

      <ChatBox
        opened={chatOpen}
        onClose={closeChat}
        settings={aiSettings}
        result={result}
        onOpenSettings={() => {
          closeChat();
          openAi();
        }}
      />

      {result && (
        <NewNoteModal
          opened={newNoteOpen}
          onClose={closeNewNote}
          layers={result.layers}
          boardryDir={boardryDir}
          parentId={newNoteParent ?? undefined}
          defaultLayer={newNoteDefaultLayer}
          onCreated={(id) => {
            void reloadActive();
            setSelectedId(id);
          }}
        />
      )}

      {layerIndex && (
        <LayerIndexDrawer
          key={layerIndex.path}
          opened
          layer={layerIndex.layer}
          path={layerIndex.path}
          initialContent={layerIndex.content}
          onClose={() => setLayerIndex(null)}
          onSave={saveLayer}
        />
      )}

      <Modal
        opened={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete note"
        centered
        size="sm"
      >
        <Text size="sm">
          Delete <b>{deleteTargetNote?.title ?? deleteTarget}</b>? This removes the markdown file.
        </Text>
        <Group justify="flex-end" mt="md">
          <Button size="xs" variant="default" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button size="xs" color="red" onClick={confirmDelete}>
            Delete
          </Button>
        </Group>
      </Modal>
    </AppShell>
  );
}
