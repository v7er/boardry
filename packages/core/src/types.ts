export interface NoteLink {
  type: string;
  target: string;
}

export interface Note {
  id: string;
  path: string;
  title: string;
  layer?: string;
  component?: string;
  kind?: string;
  type?: string;
  tags: string[];
  links: NoteLink[];
  wikilinks: string[];
  body: string;
  raw: string;
}

export interface NoteInput {
  path: string;
  content: string;
}
