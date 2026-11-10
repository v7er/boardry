import MiniSearch from "minisearch";
import type { Note } from "./types.js";
import type { BuildResult } from "./engine.js";
import { chunkNotes, type Chunk } from "./chunk.js";

export interface RagSource {
  noteId: string;
  title: string;
  layer?: string;
  score: number;
}

export interface RagContext {
  question: string;
  text: string;
  sources: RagSource[];
  noCoverage: boolean;
}

export interface RagOptions {
  budget?: number;
  topK?: number;
}

const STOP_WORDS = new Set([
  "a", "an", "the", "is", "are", "was", "were", "be", "been", "being",
  "do", "does", "did", "doing", "how", "what", "where", "why", "who",
  "when", "which", "to", "of", "in", "on", "for", "and", "or", "it",
  "its", "this", "that", "these", "those", "with", "can", "could",
  "should", "would", "i", "we", "you", "work", "works", "working",
  "use", "used", "using", "about", "from", "by", "at", "as", "if",
  "then", "than", "there", "here", "please", "tell", "explain",
]);

const SYNONYMS: Record<string, string> = {
  authentication: "auth",
  authenticate: "auth",
  authorization: "auth",
  authorized: "auth",
  publishing: "publish",
  published: "publish",
  publisher: "publish",
  deployment: "deploy",
  deployed: "deploy",
  deploying: "deploy",
  resuming: "resume",
  resumed: "resume",
  sessions: "session",
  instances: "instance",
  players: "player",
  scores: "score",
  scoring: "score",
  scored: "score",
};

function stem(word: string): string {
  if (word.length > 4 && word.endsWith("ing")) return word.slice(0, -3);
  if (word.length > 3 && word.endsWith("ed")) return word.slice(0, -2);
  if (word.length > 4 && word.endsWith("es")) return word.slice(0, -2);
  if (word.length > 3 && word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
  return word;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

export function normalizeQuestion(question: string): string[] {
  return tokenize(question)
    .map((word) => SYNONYMS[word] ?? word)
    .filter((word) => !STOP_WORDS.has(word))
    .map(stem)
    .filter((word) => word.length > 1);
}

function noteText(note: Note): string {
  return `${note.title}\n${note.summary ?? ""}\n${note.body}`;
}

function covers(terms: string[], note: Note): boolean {
  const tokens = new Set(
    tokenize(noteText(note)).map((word) => stem(SYNONYMS[word] ?? word)),
  );
  return terms.some((term) => tokens.has(term));
}

interface ChunkDoc {
  id: string;
  noteId: string;
  title: string;
  section: string;
  summary: string;
  text: string;
  line: number;
  layer: string;
}

function buildChunkIndex(chunks: Chunk[]): MiniSearch<ChunkDoc> {
  const index = new MiniSearch<ChunkDoc>({
    fields: ["title", "section", "summary", "text"],
    storeFields: ["noteId", "title", "section", "summary", "text", "line", "layer"],
  });
  index.addAll(
    chunks.map((chunk) => ({
      id: `${chunk.noteId}#${chunk.line}`,
      noteId: chunk.noteId,
      title: chunk.title,
      section: chunk.section,
      summary: chunk.summary ?? "",
      text: chunk.text,
      line: chunk.line,
      layer: chunk.layer ?? "",
    })),
  );
  return index;
}

function bestChunk(chunks: Chunk[], noteId: string, terms: string[]): Chunk | undefined {
  const candidates = chunks.filter((chunk) => chunk.noteId === noteId);
  if (candidates.length === 0) return undefined;
  return candidates
    .map((chunk) => {
      const text = chunk.text.toLowerCase();
      const score = terms.reduce((total, term) => total + (text.includes(term) ? 1 : 0), 0);
      return { chunk, score };
    })
    .sort((a, b) => b.score - a.score)[0]?.chunk;
}

export function buildRagContext(
  result: BuildResult,
  question: string,
  options: RagOptions = {},
): RagContext {
  const terms = normalizeQuestion(question);
  const budget = options.budget ?? 6000;
  const topK = options.topK ?? 4;

  if (terms.length === 0) {
    return { question, text: "", sources: [], noCoverage: true };
  }

  const graph = result.graph.graph;
  const byId = new Map(result.notes.map((note) => [note.id, note]));
  const chunks = chunkNotes(result.notes).filter((chunk) => chunk.text.trim().length > 0);
  const chunkIndex = buildChunkIndex(chunks);

  // Chunk-level retrieval: a section heading like "Connect or resume" beats a
  // large hub note that merely mentions the word once.
  const chunkHits = chunkIndex.search(terms.join(" "), {
    prefix: true,
    boost: { title: 4, section: 2, summary: 2 },
  }) as { id: string; score: number }[];

  const bestByNote = new Map<string, { score: number; chunk: Chunk }>();
  for (const hit of chunkHits) {
    const chunk = chunks.find((item) => `${item.noteId}#${item.line}` === String(hit.id));
    if (!chunk) continue;
    const current = bestByNote.get(chunk.noteId);
    if (!current || hit.score > current.score) {
      bestByNote.set(chunk.noteId, { score: hit.score, chunk });
    }
  }

  const scored: { note: Note; score: number; chunk: Chunk }[] = [];
  for (const [noteId, best] of bestByNote) {
    const note = byId.get(noteId);
    if (!note) continue;
    const titleTokens = new Set(
      tokenize(note.title).map((word) => stem(SYNONYMS[word] ?? word)),
    );
    const titleMatches = terms.filter((term) => titleTokens.has(term)).length;
    const titleBonus = terms.length > 0 ? (titleMatches / terms.length) * 6 : 0;
    const summaryHit = terms.some((term) => (note.summary ?? "").toLowerCase().includes(term))
      ? 2
      : 0;
    const degree = graph.hasNode(note.id) ? graph.degree(note.id) : 0;
    const hubPenalty = Math.log(1 + degree) * 0.4;
    scored.push({
      note,
      score: best.score + titleBonus + summaryHit - hubPenalty,
      chunk: best.chunk,
    });
  }
  scored.sort((a, b) => b.score - a.score);

  const seeds = scored.slice(0, 3);
  const ranked = new Map<string, { note: Note; score: number; chunk?: Chunk }>();
  for (const item of seeds) ranked.set(item.note.id, item);

  for (const item of seeds) {
    if (!graph.hasNode(item.note.id)) continue;
    const neighbours = new Set<string>();
    for (const edge of graph.outEdges(item.note.id)) {
      const target = graph.target(edge);
      if (target) neighbours.add(target);
    }
    for (const edge of graph.inEdges(item.note.id)) {
      const source = graph.source(edge);
      if (source) neighbours.add(source);
    }
    for (const id of neighbours) {
      if (ranked.has(id)) continue;
      const note = byId.get(id);
      if (!note) continue;
      ranked.set(id, { note, score: item.score * 0.5 });
    }
  }

  const ordered = [...ranked.values()].sort((a, b) => b.score - a.score);
  const covered = ordered.some((item) => covers(terms, item.note));
  if (!covered) {
    return { question, text: "", sources: [], noCoverage: true };
  }

  const chosen: { note: Note; chunk: Chunk; score: number }[] = [];
  for (const item of ordered.slice(0, topK)) {
    const chunk = item.chunk ?? bestChunk(chunks, item.note.id, terms);
    if (chunk) chosen.push({ note: item.note, chunk, score: item.score });
  }

  const lines: string[] = [
    `# boardy context`,
    `question: ${question}`,
    `notes: ${result.notes.length}`,
    "",
  ];

  for (const { note, chunk } of chosen) {
    const meta = [note.layer ?? "note", note.component].filter(Boolean).join(", ");
    lines.push(`## ${note.id} (${meta})`);
    lines.push(`title: ${note.title}`);
    if (note.summary) lines.push(`summary: ${note.summary}`);
    if (chunk.section) lines.push(`section: ${chunk.section} (line ${chunk.line})`);
    lines.push(chunk.text);
    const links = note.links.map((link) => `${link.type} ${link.target}`).join("; ");
    if (links) lines.push(`links: ${links}`);
    lines.push("");
  }

  const raw = lines.join("\n").trim();
  const text = raw.length > budget ? `${raw.slice(0, budget)}\n[truncated]` : raw;

  return {
    question,
    text,
    sources: chosen.map(({ note, score }) => ({
      noteId: note.id,
      title: note.title,
      layer: note.layer,
      score,
    })),
    noCoverage: false,
  };
}
