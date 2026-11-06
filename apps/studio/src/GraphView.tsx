import { useMemo } from "react";
import { ReactFlow, Background, Controls } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { BuildResult } from "@boardy/core";

const COLORS: Record<string, string> = {
  brief: "#f59e0b",
  components: "#3b82f6",
  prototypes: "#10b981",
  modules: "#8b5cf6",
  technical: "#6366f1",
  whitelist: "#ef4444",
};

interface GraphNode {
  id: string;
  position: { x: number; y: number };
  data: { label: string };
  style: React.CSSProperties;
}

export function GraphView({
  result,
  onSelect,
}: {
  result: BuildResult;
  onSelect: (id: string) => void;
}) {
  const { nodes, edges } = useMemo(() => {
    const layerIndex = new Map(result.layers.map((layer, i) => [layer, i]));
    const byLayer = new Map<string, typeof result.notes>();
    for (const note of result.notes) {
      const key = note.layer ?? "(none)";
      if (!byLayer.has(key)) byLayer.set(key, []);
      byLayer.get(key)!.push(note);
    }

    const nodes: GraphNode[] = [];
    const xStep = 250;
    const yStep = 180;
    for (const [layer, notes] of byLayer) {
      const y = (layerIndex.get(layer) ?? result.layers.length) * yStep;
      notes.forEach((note, i) => {
        nodes.push({
          id: note.id,
          position: { x: i * xStep, y },
          data: { label: note.title },
          style: {
            background: COLORS[layer] ?? "#888888",
            color: "#ffffff",
            border: "none",
            borderRadius: 8,
            padding: "8px 12px",
            fontSize: 13,
          },
        });
      });
    }

    const exported = result.graph.graph.export();
    const edges = exported.edges.map((edge, i) => ({
      id: `e${i}`,
      source: edge.source,
      target: edge.target,
      label: String(edge.attributes?.label ?? ""),
    }));

    return { nodes, edges };
  }, [result]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodeClick={(_, node) => onSelect(node.id)}
      fitView
      nodesDraggable
    >
      <Background />
      <Controls />
    </ReactFlow>
  );
}
