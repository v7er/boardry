---
title: One core, injected file access
layer: technical
kind: decision
summary: The pure core takes text and returns a graph. The CLI and Studio inject their own file access.
links:
  - type: affects
    target: "[[core]]"
  - type: relates_to
    target: "[[studio]]"
updated: 2026-11-10
---
Decision: `packages/core` does no file I/O. It receives `index.md` and a list of `{ path, content }` and returns notes, graph, search index, and errors.

Why: the CLI and Studio must parse a note and type a link the same way. A second parser in the desktop app would drift.

Consequences:

- Each surface owns discovery, reading, writing, and watching.
- The CLI uses Node `fs`, `fast-glob`, and `chokidar`.
- Studio uses Rust commands rather than the Tauri fs plugin, so hidden folders and arbitrary locations work.
- The core can be tested with plain strings. `engine.test.ts` does exactly that.
