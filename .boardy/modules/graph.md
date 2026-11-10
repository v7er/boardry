---
title: Graph
layer: modules
component: core
kind: module
summary: Builds a directed multigraph with graphology and computes backlinks, orphans, and broken links.
links:
  - type: refines
    target: "[[core]]"
updated: 2026-11-10
---
`packages/core/src/graph.ts` builds the graph.

- Nodes are notes, keyed by path without `.boardy/` and without `.md`.
- Edges come from typed `links` in the frontmatter and from wikilinks in the body. A bare wikilink becomes `relates_to`.
- A target resolves by exact id first, then by basename, so a wikilink to `core` finds `components/core`.
- A target that resolves to nothing is recorded as a broken link.
- Backlinks are kept per target. Orphans are notes with no edge in either direction.
- Brainstorming notes never enter, because the engine removes them before the graph is built.

The graph is `directed` and `multi`, so two notes can carry more than one edge.
