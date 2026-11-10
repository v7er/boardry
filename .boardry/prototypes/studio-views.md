---
title: Studio views
layer: prototypes
component: studio
kind: interface
summary: Graph and IDE views over the same notes, plus the editor drawer, command palette, and AI chat.
links:
  - type: refines
    target: "[[studio]]"
  - type: relates_to
    target: "[[ai-context]]"
updated: 2026-11-10
---
Studio has two views over the same folder, switched in the header.

Graph:

- Layers stack top to bottom as bands, labeled and clickable.
- Nodes are colored by layer and can be expanded in place.
- Only `refines` and `part_of` edges are drawn. Notes with no hierarchical edge are listed as standalone in the sidebar instead of the canvas.
- `+` on a node creates a child note in the parent's layer and links it with `refines`.
- Dragging a node vertically snaps it to a layer band, moves the file into that layer folder, and rewrites its `layer` field.
- The Ask box searches notes when Enter is pressed.

IDE:

- A file tree grouped by layer and an MDXEditor with markdown and YAML frontmatter.
- Save writes the note and reloads the graph.

Around both:

- A right drawer opens the selected note for editing.
- `Cmd-K` opens the command palette, backed by the full-text index.
- A right drawer hosts the AI chat.
