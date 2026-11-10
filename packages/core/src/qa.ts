import { parse as parseYaml } from "yaml";
import { normalizeQuestion } from "./rag.js";

export interface QaEntry {
  id: string;
  path: string;
  question: string;
  answer: string;
  evidence: string[];
  check?: string;
  status: string;
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface QaMatch {
  entry: QaEntry;
  score: number;
  exact: boolean;
}

export function parseQaEntry(pagePath: string, raw: string): QaEntry | null {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return null;
  const parsed = parseYaml(match[1] ?? "");
  if (!parsed || typeof parsed !== "object") return null;
  const data = parsed as Record<string, unknown>;
  const question = typeof data.question === "string" ? data.question.trim() : "";
  const answer = typeof data.answer === "string" ? data.answer.trim() : "";
  if (!question || !answer) return null;

  const file = pagePath.split("/").pop() ?? pagePath;
  const id = file.replace(/\.md$/, "");
  const evidence = Array.isArray(data.evidence)
    ? data.evidence.filter((item): item is string => typeof item === "string")
    : [];
  const verified =
    data.verified && typeof data.verified === "object"
      ? (data.verified as Record<string, unknown>)
      : {};

  return {
    id,
    path: pagePath,
    question,
    answer,
    evidence,
    check: typeof data.check === "string" ? data.check : undefined,
    status: typeof data.status === "string" ? data.status : "draft",
    verifiedBy: typeof verified.by === "string" ? verified.by : undefined,
    verifiedAt: typeof verified.at === "string" ? verified.at : undefined,
  };
}

/**
 * Dice overlap over normalized question tokens. Exact match wins outright;
 * everything else must clear the threshold or the answer is "unknown".
 */
export function matchQa(entries: QaEntry[], query: string, threshold = 0.5): QaMatch | null {
  const queryTokens = normalizeQuestion(query);
  if (queryTokens.length === 0) return null;
  const queryNorm = queryTokens.join(" ");

  let best: QaMatch | null = null;
  for (const entry of entries) {
    const entryTokens = normalizeQuestion(entry.question);
    if (entryTokens.length === 0) continue;
    const exact = entryTokens.join(" ") === queryNorm;
    const shared = queryTokens.filter((token) => entryTokens.includes(token)).length;
    const dice = (2 * shared) / (queryTokens.length + entryTokens.length);
    const score = exact ? 1 : dice;
    if (!best || score > best.score) best = { entry, score, exact };
  }

  if (!best) return null;
  if (best.exact) return best;
  return best.score >= threshold ? best : null;
}
