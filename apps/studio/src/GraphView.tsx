import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Background,
  Controls,
  Handle,
  MiniMap,
  Panel,
  Position,
  ReactFlow,
  useNodesState,
  ViewportPortal,
  type Node,
  type NodeProps,
  type ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Button, Group, useComputedColorScheme } from "@mantine/core";
import { IconEye, IconEyeOff, IconPlus } from "@tabler/icons-react";
import { SmartEdgeProvider, createSmartEdge } from "@tisoap/react-flow-smart-edge";
import type { BuildResult, Note } from "@boardry/core";
import { moveNote, setLayer } from "./boardry";
import { CommandBox } from "./CommandBox";
import { NodeIcon } from "./NodeIcon";
import { defaultIconFor } from "./icons";
import "./graph.css";

const COLORS: Record<string, string> = {
  brief: "#f59e0b",
  components: "#3b82f6",
  prototypes: "#10b981",
  modules: "#8b5cf6",
  technical: "#6366f1",
  whitelist: "#ef4444",
};

const X_STEP = 300;
const Y_STEP = 130;
const BOX_PAD = 24;
const LABEL_H = 28;
const BOX_GAP = 24;
const PREVIEW_LIMIT = 160;

function truncate(text: string): string {
  return text.length > PREVIEW_LIMIT ? `${text.slice(0, PREVIEW_LIMIT)}...` : text;
}

type BoardryNodeData = {
  label: string;
  layer: string;
  color: string;
  iconName: string;
  iconColor: string;
  summary: string;
  preview: string;
  brainstorm: string;
  collapsed: boolean;
  childCount: number;
  dimmed: boolean;
  highlighted: boolean;
};

type BoardryNode = Node<BoardryNodeData>;

const GraphActions = createContext<{
  expanded: Set<string>;
  openNote: (id: string) => void;
  createChild: (id: string) => void;
  collapse: (id: string) => void;
  setIcon: (id: string, name: string, color: string) => void;
}>({
  expanded: new Set(),
  openNote: () => {},
  createChild: () => {},
  collapse: () => {},
  setIcon: () => {},
});

const iconButtonStyle: React.CSSProperties = {
  width: 20,
  height: 20,
  borderRadius: 10,
  border: "none",
  background: "rgba(255,255,255,0.28)",
  color: "#ffffff",
  cursor: "pointer",
  padding: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

function BoardryNodeView({ id, data }: NodeProps<BoardryNode>) {
  const { expanded, openNote, createChild, collapse, setIcon } = useContext(GraphActions);
  const open = expanded.has(id);

  return (
    <div
      className="boardry-node"
      style={{
        background: data.color,
        color: "#ffffff",
        borderRadius: 8,
        padding: "8px 10px",
        fontSize: 13,
        minWidth: 140,
        width: open ? 280 : undefined,
        maxWidth: open ? 280 : 240,
        border: data.collapsed ? "1px dashed rgba(255,255,255,0.7)" : "none",
        opacity: data.dimmed ? 0.2 : 1,
        boxShadow: data.highlighted ? "0 0 0 3px rgba(250, 204, 21, 0.85)" : undefined,
        transition: "opacity 160ms ease, box-shadow 160ms ease",
      }}
    >
      <Handle type="target" position={Position.Top} isConnectable={false} style={{ opacity: 0 }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
          <NodeIcon
            name={data.iconName}
            color={data.iconColor}
            onChange={(name, color) => setIcon(id, name, color)}
          />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {data.label}
            {data.collapsed && data.childCount > 0 && (
              <span style={{ marginLeft: 4, fontSize: 10, opacity: 0.85 }}>(+{data.childCount})</span>
            )}
          </span>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {data.childCount > 0 && (
            <button
              className="nodrag"
              onClick={(e) => {
                e.stopPropagation();
                collapse(id);
              }}
              aria-label={data.collapsed ? "Expand branch" : "Hide branch"}
              style={iconButtonStyle}
            >
              {data.collapsed ? <IconEyeOff size={13} /> : <IconEye size={13} />}
            </button>
          )}
          <button
            className="nodrag"
            onClick={(e) => {
              e.stopPropagation();
              createChild(id);
            }}
            aria-label="Create a linked note"
            style={iconButtonStyle}
          >
            <IconPlus size={13} />
          </button>
        </div>
      </div>
      {open && (
        <div
          className="nodrag"
          onClick={(e) => {
            e.stopPropagation();
            openNote(id);
          }}
          style={{
            marginTop: 8,
            paddingTop: 6,
            borderTop: "1px solid rgba(255,255,255,0.28)",
            fontSize: 11,
            lineHeight: 1.5,
            whiteSpace: "pre-wrap",
            overflowWrap: "anywhere",
            cursor: "pointer",
          }}
        >
          {data.summary ? (
            <div>{data.summary}</div>
          ) : data.preview ? (
            <div>{truncate(data.preview)}</div>
          ) : (
            <div style={{ opacity: 0.75 }}>No summary.</div>
          )}
          {data.brainstorm && (
            <div
              style={{
                marginTop: 6,
                paddingTop: 6,
                borderTop: "1px dashed rgba(255,255,255,0.28)",
                whiteSpace: "pre-wrap",
              }}
            >
              {data.brainstorm}
            </div>
          )}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} isConnectable={false} style={{ opacity: 0 }} />
    </div>
  );
}

const nodeTypes = { boardry: BoardryNodeView };
const edgeTypes = { smart: createSmartEdge("smoothstep", { hops: { borderRadius: 8 } }) };

function tint(hex: string, alpha: number): string {
  const value = hex.replace("#", "");
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

interface LayerBox {
  layer: string;
  left: number;
  top: number;
  width: number;
  height: number;
}

function LayerBoxes({
  boxes,
  activeLayer,
  onLayerClick,
}: {
  boxes: LayerBox[];
  activeLayer: string | null;
  onLayerClick: (layer: string) => void;
}) {
  return (
    <ViewportPortal>
      {boxes.map(({ layer, left, top, width, height }) => {
        const active = layer === activeLayer;
        const color = COLORS[layer] ?? "#888888";
        return (
          <div
            key={layer}
            style={{
              position: "absolute",
              left,
              top,
              width,
              height,
              borderRadius: 12,
              border: active
                ? "1px solid rgba(250, 204, 21, 0.6)"
                : "1px dashed var(--mantine-color-default-border)",
              background: tint(color, active ? 0.22 : 0.12),
              pointerEvents: "none",
              zIndex: 0,
              transition: "background 140ms ease",
            }}
          >
            <button
              onClick={() => onLayerClick(layer)}
              style={{
                position: "absolute",
                top: 6,
                left: 10,
                fontSize: 11,
                letterSpacing: 0.4,
                textTransform: "uppercase",
                color: "var(--mantine-color-dimmed)",
                background: "transparent",
                border: "none",
                padding: 0,
                cursor: "pointer",
                pointerEvents: "auto",
              }}
            >
              {layer}
            </button>
          </div>
        );
      })}
    </ViewportPortal>
  );
}

export function GraphView({
  result,
  boardryDir,
  files,
  onSelect,
  onCreateChild,
  onMoved,
  onLayerClick,
  onSetIcon,
}: {
  result: BuildResult;
  boardryDir: string;
  files: { path: string; content: string }[];
  onSelect: (id: string) => void;
  onCreateChild: (id: string) => void;
  onMoved: () => void;
  onLayerClick: (layer: string) => void;
  onSetIcon: (id: string, name: string, color: string) => void;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const [dragLayer, setDragLayer] = useState<string | null>(null);
  const [highlighted, setHighlighted] = useState<string[]>([]);
  const [instance, setInstance] = useState<ReactFlowInstance<BoardryNode> | null>(null);
  const colorScheme = useComputedColorScheme("light");
  const edgeStroke = colorScheme === "dark" ? "#34343a" : "#9a9aa0";

  const { computedNodes, edges, boxes } = useMemo(() => {
    const graph = result.graph.graph;
    const exported = graph.export();
    const parentEdges = exported.edges.filter((edge) =>
      ["refines", "part_of"].includes(String(edge.attributes?.label ?? "")),
    );

    const connectedIds = new Set<string>();
    const children = new Map<string, string[]>();
    for (const edge of parentEdges) {
      connectedIds.add(edge.source);
      connectedIds.add(edge.target);
      if (!children.has(edge.target)) children.set(edge.target, []);
      children.get(edge.target)!.push(edge.source);
    }

    const hidden = new Set<string>();
    for (const id of collapsed) {
      const stack = [...(children.get(id) ?? [])];
      while (stack.length > 0) {
        const next = stack.pop()!;
        if (hidden.has(next)) continue;
        hidden.add(next);
        stack.push(...(children.get(next) ?? []));
      }
    }

    const connected = result.notes.filter((note) => connectedIds.has(note.id));
    const byLayer = new Map<string, Note[]>();
    for (const note of connected) {
      const key = note.layer ?? "(none)";
      if (!byLayer.has(key)) byLayer.set(key, []);
      byLayer.get(key)!.push(note);
    }

    const specs: { layer: string; cols: number; rows: number; width: number; height: number }[] = [];
    for (const layer of result.layers) {
      const notes = byLayer.get(layer);
      if (!notes || notes.length === 0) continue;
      const cols = Math.max(1, Math.ceil(Math.sqrt(notes.length)));
      const rows = Math.ceil(notes.length / cols);
      specs.push({
        layer,
        cols,
        rows,
        width: cols * X_STEP + BOX_PAD * 2,
        height: LABEL_H + rows * Y_STEP + BOX_PAD,
      });
    }

    const MAX_ROW_W = 1600;
    const boxes: LayerBox[] = [];
    let cursorX = 0;
    let cursorY = 0;
    let rowHeight = 0;
    for (const spec of specs) {
      if (cursorX > 0 && cursorX + spec.width > MAX_ROW_W) {
        cursorX = 0;
        cursorY += rowHeight + BOX_GAP;
        rowHeight = 0;
      }
      boxes.push({
        layer: spec.layer,
        left: cursorX,
        top: cursorY,
        width: spec.width,
        height: spec.height,
      });
      cursorX += spec.width + BOX_GAP;
      rowHeight = Math.max(rowHeight, spec.height);
    }

    const boxByLayer = new Map(boxes.map((box) => [box.layer, box]));
    const computedNodes: BoardryNode[] = [];
    for (const spec of specs) {
      const box = boxByLayer.get(spec.layer)!;
      const notes = byLayer.get(spec.layer)!;
      notes.forEach((note, i) => {
        if (hidden.has(note.id)) return;
        const col = i % spec.cols;
        const row = Math.floor(i / spec.cols);
        const position = {
          x: box.left + BOX_PAD + col * X_STEP,
          y: box.top + LABEL_H + row * Y_STEP,
        };
        const base = note.id.split("/").pop() ?? note.id;
        const brainstorm = result.brainstorming
          .filter((item) => {
            const itemBase = (item.path.split("/").pop() ?? "")
              .replace(/^_/, "")
              .replace(/\.md$/, "");
            return itemBase === base;
          })
          .map((item) => item.body.trim())
          .filter(Boolean)
          .join("\n\n");
        const iconColor = note.icon?.color ?? COLORS[spec.layer] ?? "#888888";
        computedNodes.push({
          id: note.id,
          type: "boardry",
          position,
          data: {
            label: note.title,
            layer: spec.layer,
            color: iconColor,
            iconName: note.icon?.name ?? defaultIconFor(note.id),
            iconColor,
            summary: note.summary ?? "",
            preview: note.body.trim(),
            brainstorm,
            collapsed: collapsed.has(note.id),
            childCount: (children.get(note.id) ?? []).length,
            dimmed: highlighted.length > 0 && !highlighted.includes(note.id),
            highlighted: highlighted.includes(note.id),
          },
        });
      });
    }

    const visible = new Set(computedNodes.map((node) => node.id));
    let edgeId = 0;
    const edges = parentEdges
      .filter((edge) => visible.has(edge.source) && visible.has(edge.target))
      .map((edge) => ({
        id: `e${edgeId++}`,
        source: edge.target,
        target: edge.source,
        type: "smart",
      }));

    return { computedNodes, edges, boxes };
  }, [result, collapsed, highlighted]);

  const [nodes, setNodes, onNodesChange] = useNodesState<BoardryNode>(computedNodes);

  useEffect(() => {
    setNodes((current) => {
      const existing = new Map(current.map((node) => [node.id, node]));
      return computedNodes.map((node) => {
        const previous = existing.get(node.id);
        return previous ? { ...node, position: previous.position } : node;
      });
    });
  }, [computedNodes, setNodes]);

  const toggle = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);
  const openNote = useCallback((id: string) => onSelect(id), [onSelect]);
  const createChild = useCallback((id: string) => onCreateChild(id), [onCreateChild]);
  const setIcon = useCallback(
    (id: string, name: string, color: string) => onSetIcon(id, name, color),
    [onSetIcon],
  );
  const collapse = useCallback((id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const nearestBox = useCallback(
    (position: { x: number; y: number }) => {
      let best: LayerBox | null = null;
      let bestDistance = Number.POSITIVE_INFINITY;
      for (const box of boxes) {
        const cx = box.left + box.width / 2;
        const cy = box.top + box.height / 2;
        const distance = Math.hypot(position.x - cx, position.y - cy);
        if (distance < bestDistance) {
          best = box;
          bestDistance = distance;
        }
      }
      return best;
    },
    [boxes],
  );

  const onNodeDrag = useCallback(
    (_: MouseEvent | TouchEvent, node: BoardryNode) => {
      setDragLayer(nearestBox(node.position)?.layer ?? null);
    },
    [nearestBox],
  );

  const onNodeDragStop = useCallback(
    async (_: MouseEvent | TouchEvent, node: BoardryNode) => {
      setDragLayer(null);
      const note = result.notes.find((n) => n.id === node.id);
      if (!note) return;
      const targetLayer = nearestBox(node.position)?.layer;
      if (!targetLayer || targetLayer === note.layer) return;
      const filename = note.path.split("/").pop() ?? `${node.id}.md`;
      const to = `${targetLayer}/${filename}`;
      const content = setLayer(note.raw, targetLayer);
      try {
        await moveNote(boardryDir, note.path, to, content);
        onMoved();
      } catch (e) {
        console.error(e);
      }
    },
    [result, boardryDir, onMoved, nearestBox],
  );

  const reset = useCallback(() => {
    setExpanded(new Set());
    setCollapsed(new Set());
    setHighlighted([]);
    setNodes(computedNodes);
    instance?.fitView({ duration: 300 });
  }, [computedNodes, setNodes, instance]);

  const allExpanded = nodes.length > 0 && nodes.every((node) => expanded.has(node.id));

  const expandAll = useCallback(() => {
    setExpanded((prev) => {
      const ids = nodes.map((node) => node.id);
      const everything = ids.length > 0 && ids.every((id) => prev.has(id));
      return everything ? new Set() : new Set(ids);
    });
  }, [nodes]);

  const actions = useMemo(
    () => ({ expanded, openNote, createChild, collapse, setIcon }),
    [expanded, openNote, createChild, collapse, setIcon],
  );

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <GraphActions.Provider value={actions}>
        <SmartEdgeProvider nodes={nodes} options={{ routeWhileDragging: true }}>
          <ReactFlow<BoardryNode>
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodesChange={onNodesChange}
            onNodeClick={(_, node) => toggle(node.id)}
            onPaneClick={() => setHighlighted([])}
            onNodeDrag={onNodeDrag}
            onNodeDragStop={onNodeDragStop}
            onInit={setInstance}
            fitView
            nodesDraggable
            defaultEdgeOptions={{ style: { strokeWidth: 1.5, stroke: edgeStroke } }}
          >
            <Background color={colorScheme === "dark" ? "#161616" : "#e4e4e4"} />
            <Controls />
            <MiniMap pannable zoomable position="bottom-right" />
            <Panel position="top-left">
              <CommandBox
                result={result}
                files={files}
                onOpen={onSelect}
                onHighlight={setHighlighted}
              />
            </Panel>
            <Panel position="top-right">
              <Group gap="xs">
                <Button size="compact-xs" variant="default" onClick={expandAll}>
                  {allExpanded ? "Collapse all" : "Expand all"}
                </Button>
                <Button size="compact-xs" variant="default" onClick={reset}>
                  Reset layout
                </Button>
              </Group>
            </Panel>
            <LayerBoxes boxes={boxes} activeLayer={dragLayer} onLayerClick={onLayerClick} />
          </ReactFlow>
        </SmartEdgeProvider>
      </GraphActions.Provider>
    </div>
  );
}
