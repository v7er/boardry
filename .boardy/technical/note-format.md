---
title: Note format
layer: technical
kind: convention
summary: A note is a markdown file with YAML frontmatter. The layer places it and the links type its edges.
links:
  - type: affects
    target: "[[parser]]"
  - type: relates_to
    target: "[[agent-skills]]"
updated: 2026-11-10
---
A note is a file under `.boardy/<layer>/<slug>.md`.

```markdown
---
title: Refunds go through the ledger
layer: technical
component: billing-api
kind: decision
summary: One line the graph and the AI can read.
tags: [refunds, ledger]
links:
  - type: affects
    target: "<note-id>"
  - type: implements
    target: "<other-note-id>"
---

Body in plain markdown. A bare wikilink also becomes a relates_to edge.
```

A `target` is a note id in the project's double-bracket wikilink form. The example uses `<note-id>` so it does not create a real edge.

Rules the code enforces or the docs expect:

- `layer` should be one of the names in `index.md`.
- `title`, `component`, `kind`, `summary`, `tags`, `icon`, `links`, and `updated` are optional in the zod schema.
- `type: brainstorming` keeps the file out of the graph and the index. A filename starting with `_` does the same.
- A lower-layer note should `refines` a note above it, or it has no place in the waterfall.
- `index.md` and files named `index.md` inside a layer folder are not notes.
