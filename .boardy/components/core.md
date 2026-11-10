---
title: Core
layer: components
component: core
kind: component
summary: The pure TypeScript engine in packages/core. It parses, validates, builds the graph, and builds the search index.
links:
  - type: refines
    target: "[[boardy]]"
  - type: contains
    target: "[[parser]]"
  - type: contains
    target: "[[graph]]"
  - type: contains
    target: "[[search-index]]"
updated: 2026-11-10
---
`packages/core` (published as `@boardy/core`) is the shared engine. It is pure TypeScript: it takes `index.md` plus note text and returns a graph and a search index. It does not read or write files.

`buildKnowledge(indexMd, inputs)` is the one entry point. The CLI and Studio both call it, so they cannot disagree about how a note is parsed or how a link is typed.

The engine:

1. reads the layer list from `index.md`;
2. parses each note's frontmatter and wikilink syntax;
3. validates the frontmatter with zod;
4. separates `type: brainstorming` notes;
5. builds the graph with graphology and the index with MiniSearch.
