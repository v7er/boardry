import { parse as parseYaml } from "yaml";

export function parseLayerIndex(indexMd: string): string[] {
  const match = indexMd.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return [];
  const parsed = parseYaml(match[1] ?? "");
  const data = parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
  const layers = data.layers;
  if (!Array.isArray(layers)) return [];
  return layers.map((layer) => String(layer)).filter(Boolean);
}
