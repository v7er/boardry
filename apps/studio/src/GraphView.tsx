import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
  useStore,
  ViewportPortal,
  type Node,
  type NodeProps,
  type ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Button, Group, useComputedColorScheme } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { SmartEdgeProvider, createSmartEdge } from "@tisoap/react-flow-smart-edge";
import type { BuildResult, Note } from "@boardy/core";
import { moveNote, setLayer } from "./boardy";
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

const Y_STEP = 200;
const X_STEP = 260;
const PREVIEW_LIMIT = 160;

function truncate(text: string): string {
  return text.length > PREVIEW_LIMIT ? `${text.slice(0, PREVIEW_LIMIT)}...` : text;
}

const NODE_GAP = 44;

function rectsOverlap(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number },
): boolean {
  return (
    a.x < b.x + b.w + NODE_GAP &&
    a.x + a.w + NODE_GAP > b.x &&
    a.y < b.y + b.h + NODE_GAP &&
    a.y + a.h + NODE_GAP > b.y
  );
}

/** Push overlapping nodes down until no two rectangles overlap. */
function avoidOverlaps(nodes: BoardyNode[]): BoardyNode[] {
  const rects = nodes.map((node) => ({
    id: node.id,
    x: node.position.x,
    y: node.position.y,
    w: node.measured?.width ?? 200,
    h: node.measured?.height ?? 60,
  }));
  const order = [...rects].sort((a, b) => a.y - b.y || a.x - b.x);

  for (let pass = 0; pass < 20; pass += 1) {
    order.sort((a, b) => a.y - b.y || a.x - b.x);
    let moved = false;
    for (let i = 0; i < order.length; i += 1) {
      for (let j = i + 1; j < order.length; j += 1) {
        if (rectsOverlap(order[i]!, order[j]!)) {
          order[j]!.y = order[i]!.y + order[i]!.h + NODE_GAP;
          moved = true;
        }
      }
    }
    if (!moved) break;
  }

  const byId = new Map(order.map((rect) => [rect.id, rect]));
  return nodes.map((node) => {
    const rect = byId.get(node.id)!;
    return rect.x === node.position.x && rect.y === node.position.y
      ? node
      : { ...node, position: { x: rect.x, y: rect.y } };
  });
}

const LAYER_GAP = 40;

/** Keep each layer box stacked below the previous one, in index.md order. */
function stackLayers(nodes: BoardyNode[], layers: string[]): BoardyNode[] {
  const boxes = new Map<string, { minY: number; maxY: number }>();
  for (const node of nodes) {
    const height = node.measured?.height ?? 56;
    const current = boxes.get(node.data.layer);
    boxes.set(
      node.data.layer,
      current
        ? {
            minY: Math.min(current.minY, node.position.y),
            maxY: Math.max(current.maxY, node.position.y + height),
          }
        : { minY: node.position.y, maxY: node.position.y + height },
    );
  }

  const shifts = new Map<string, number>();
  let previousBottom: number | null = null;
  for (const layer of layers) {
    const box = boxes.get(layer);
    if (!box) continue;
    const top: number =
      previousBottom === null ? box.minY : Math.max(box.minY, previousBottom + LAYER_GAP);
    shifts.set(layer, top - box.minY);
    previousBottom = top + (box.maxY - box.minY);
  }

  return nodes.map((node) => {
    const shift = shifts.get(node.data.layer) ?? 0;
    return shift === 0
      ? node
      : { ...node, position: { x: node.position.x, y: node.position.y + shift } };
  });
}

type BoardyNodeData = {
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
};

type BoardyNode = Node<BoardyNodeData>;

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

function BoardyNodeView({ id, data }: NodeProps<BoardyNode>) {
  const { expanded, openNote, createChild, collapse, setIcon } = useContext(GraphActions);
  const open = expanded.has(id);

  return (
    <div
      className="boardy-node"
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
      }}
    >
      <Handle type="target" position={Position.Top} isConnectable={false} style={{ opacity: 0 }} />
      {data.childCount > 0 && (
        <button
          className="nodrag collapse-dot"
          onClick={(e) => {
            e.stopPropagation();
            collapse(id);
          }}
          aria-label={data.collapsed ? "Expand branch" : "Hide branch"}
          style={{
            position: "absolute",
            top: -7,
            left: "50%",
            transform: "translateX(-50%)",
            width: 12,
            height: 12,
            borderRadius: 6,
            border: "1px solid rgba(255,255,255,0.95)",
            background: data.collapsed ? "#ffffff" : "rgba(255,255,255,0.15)",
            cursor: "pointer",
            padding: 0,
            zIndex: 2,
          }}
        />
      )}
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

const nodeTypes = { boardy: BoardyNodeView };
const edgeTypes = { smart: createSmartEdge("smoothstep", { hops: { borderRadius: 8 } }) };

/** Layer name that keeps its screen size while the canvas zooms. */
function LayerLabel({ layer, onClick }: { layer: string; onClick: () => void }) {
  const zoom = useStore((state) => state.transform[2]);
  return (
    <button
      className="nodrag nopan"
      onClick={onClick}
      style={{
        position: "absolute",
        top: 4,
        left: 8,
        transform: `scale(${1 / zoom})`,
        transformOrigin: "top left",
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
  );
}

function LayerBands({
  layers,
  nodes,
  activeLayer,
  onLayerClick,
}: {
  layers: string[];
  nodes: BoardyNode[];
  activeLayer: string | null;
  onLayerClick: (layer: string) => void;
}) {
  const PAD = 14;

  // Bounds are in flow coordinates, so they only change when the chart changes
  // (node moved, resized, added or removed) — never on pan or zoom.
  const bounds = useMemo(() => {
    const map = new Map<string, { minX: number; minY: number; maxX: number; maxY: number }>();
    for (const node of nodes) {
      const layer = node.data.layer;
      const width = node.measured?.width ?? 200;
      const height = node.measured?.height ?? 56;
      const current = map.get(layer);
      if (!current) {
        map.set(layer, {
          minX: node.position.x,
          minY: node.position.y,
          maxX: node.position.x + width,
          maxY: node.position.y + height,
        });
      } else {
        current.minX = Math.min(current.minX, node.position.x);
        current.minY = Math.min(current.minY, node.position.y);
        current.maxX = Math.max(current.maxX, node.position.x + width);
        current.maxY = Math.max(current.maxY, node.position.y + height);
      }
    }
    return map;
  }, [nodes]);

  return (
    <ViewportPortal>
      {layers.map((layer, index) => {
        const box = bounds.get(layer);
        if (!box) return null;
        const active = layer === activeLayer;
        return (
          <div
            key={layer}
            style={{
              position: "absolute",
              left: box.minX - PAD,
              top: box.minY - PAD,
              width: box.maxX - box.minX + PAD * 2,
              height: box.maxY - box.minY + PAD * 2,
              border: active
                ? "1px solid rgba(250, 204, 21, 0.55)"
                : "1px solid var(--mantine-color-default-border)",
              borderRadius: 10,
              background: active
                ? "rgba(250, 204, 21, 0.2)"
                : index % 2 === 0
                  ? "rgba(127, 127, 127, 0.12)"
                  : "rgba(127, 127, 127, 0.05)",
              pointerEvents: "none",
              zIndex: 0,
              transition: "background 140ms ease",
            }}
          >
            <LayerLabel layer={layer} onClick={() => onLayerClick(layer)} />
          </div>
        );
      })}
    </ViewportPortal>
  );
}

export function GraphView({
  result,
  boardyDir,
  files,
  onSelect,
  onCreateChild,
  onMoved,
  onLayerClick,
  onSetIcon,
}: {
  result: BuildResult;
  boardyDir: string;
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
  const draggingRef = useRef(false);
  const [instance, setInstance] = useState<ReactFlowInstance<BoardyNode> | null>(null);
  const colorScheme = useComputedColorScheme("light");
  const edgeStroke = colorScheme === "dark" ? "#34343a" : "#9a9aa0";

  const { computedNodes, edges } = useMemo(() => {
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
      // refines/part_of go child -> parent, so remember parent -> [children].
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

    const layerIndex = new Map(result.layers.map((layer, i) => [layer, i]));

    const byLayer = new Map<string, Note[]>();
    for (const note of result.notes) {
      if (!connectedIds.has(note.id) || hidden.has(note.id)) continue;
      const key = note.layer ?? "(none)";
      if (!byLayer.has(key)) byLayer.set(key, []);
      byLayer.get(key)!.push(note);
    }

    const computedNodes: BoardyNode[] = [];
    for (const [layer, notes] of byLayer) {
      const row = layerIndex.get(layer) ?? result.layers.length;
      notes.forEach((note, i) => {
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
        const iconColor = note.icon?.color ?? COLORS[layer] ?? "#888888";
        computedNodes.push({
          id: note.id,
          type: "boardy",
          position: { x: i * X_STEP, y: row * Y_STEP },
          data: {
            label: note.title,
            layer,
            color: iconColor,
            iconName: note.icon?.name ?? defaultIconFor(note.id),
            iconColor,
            summary: note.summary ?? "",
            preview: note.body.trim(),
            brainstorm,
            collapsed: collapsed.has(note.id),
            childCount: (children.get(note.id) ?? []).length,
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

    return { computedNodes, edges };
  }, [result, collapsed]);

  const [nodes, setNodes, onNodesChange] = useNodesState<BoardyNode>(computedNodes);

  useEffect(() => {
    setNodes((current) => {
      const existing = new Map(current.map((node) => [node.id, node]));
      return computedNodes.map((node) => {
        const previous = existing.get(node.id);
        return previous ? { ...node, position: previous.position } : node;
      });
    });
  }, [computedNodes, setNodes]);

  useEffect(() => {
    if (draggingRef.current) return;
    if (nodes.length === 0) return;
    if (nodes.some((node) => !node.measured?.width)) return;
    const resolved = stackLayers(avoidOverlaps(nodes), result.layers);
    if (resolved.some((node, index) => node !== nodes[index])) {
      setNodes(resolved);
    }
  }, [nodes, setNodes, result.layers]);

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

  const onNodeDrag = useCallback(
    (_: MouseEvent | TouchEvent, node: BoardyNode) => {
      const row = Math.max(
        0,
        Math.min(result.layers.length - 1, Math.round(node.position.y / Y_STEP)),
      );
      setDragLayer(result.layers[row] ?? null);
    },
    [result.layers],
  );

  const onNodeDragStart = useCallback(() => {
    draggingRef.current = true;
  }, []);

  const onNodeDragStop = useCallback(
    async (_: MouseEvent | TouchEvent, node: BoardyNode) => {
      draggingRef.current = false;
      setDragLayer(null);
      const note = result.notes.find((n) => n.id === node.id);
      if (!note) return;
      const currentRow = result.layers.indexOf(note.layer ?? "");
      if (currentRow < 0) return;
      const targetRow = Math.max(
        0,
        Math.min(result.layers.length - 1, Math.round(node.position.y / Y_STEP)),
      );
      if (targetRow === currentRow) return;
      const targetLayer = result.layers[targetRow];
      if (!targetLayer) return;
      const filename = note.path.split("/").pop() ?? `${node.id}.md`;
      const to = `${targetLayer}/${filename}`;
      const content = setLayer(note.raw, targetLayer);
      try {
        await moveNote(boardyDir, note.path, to, content);
        onMoved();
      } catch (e) {
        console.error(e);
      }
    },
    [result, boardyDir, onMoved],
  );

  const reset = useCallback(() => {
    setExpanded(new Set());
    setCollapsed(new Set());
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
          <ReactFlow<BoardyNode>
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodesChange={onNodesChange}
            onNodeClick={(_, node) => toggle(node.id)}
            onNodeDrag={onNodeDrag}
            onNodeDragStart={onNodeDragStart}
            onNodeDragStop={onNodeDragStop}
            onInit={setInstance}
            fitView
            nodesDraggable
            snapToGrid
            snapGrid={[1, Y_STEP]}
            defaultEdgeOptions={{ style: { strokeWidth: 1.5, stroke: edgeStroke } }}
          >
            <Background color={colorScheme === "dark" ? "#161616" : "#e4e4e4"} />
            <Controls />
            <MiniMap pannable zoomable position="bottom-right" />
            <Panel position="top-left">
              <CommandBox result={result} files={files} onOpen={onSelect} />
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
            <LayerBands
              layers={result.layers}
              nodes={nodes}
              activeLayer={dragLayer}
              onLayerClick={onLayerClick}
            />
          </ReactFlow>
        </SmartEdgeProvider>
      </GraphActions.Provider>
    </div>
  );
}
