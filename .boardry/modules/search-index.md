---
title: Search index
layer: modules
component: core
kind: module
summary: A MiniSearch index over title, body, and tags, used by ask, search, the palette, and chat context.
links:
  - type: refines
    target: "[[core]]"
  - type: relates_to
    target: "[[ai-context]]"
updated: 2026-11-10
---
`packages/core/src/search.ts` builds one MiniSearch index per load.

- Searchable fields: title, body, tags.
- Stored fields: id, title, layer, kind.
- `boardry ask` boosts title matches and prints the top 10.
- `boardry search` prints the top 20.
- The command palette and the Studio chat context both call the same index.

Ranking is lexical, not semantic. A question phrased with different words than the note may find nothing. There is no embedding model in the project.
