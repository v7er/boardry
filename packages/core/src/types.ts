export interface NoteLink {
  type: string;
  target: string;
}

export interface NoteIcon {
  name?: string;
  color?: string;
}

export interface NoteEvidence {
  path: string;
  line: number;
}

export type NoteSource = "boardy" | "openwiki";

export interface Note {
  id: string;
  path: string;
  title: string;
  layer?: string;
  component?: string;
  kind?: string;
  type?: string;
  summary?: string;
  icon?: NoteIcon;
  source?: NoteSource;
  updated?: string;
  evidence?: NoteEvidence[];
  tags: string[];
  links: NoteLink[];
  wikilinks: string[];
  body: string;
  raw: string;
}

export interface NoteInput {
  path: string;
  content: string;
  source?: NoteSource;
}
