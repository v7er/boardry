---
title: CLI commands
layer: prototypes
component: cli
kind: interface
summary: The command surface of boardry, grouped by query, layers, write, index, and tooling.
links:
  - type: refines
    target: "[[cli]]"
  - type: relates_to
    target: "[[agent-skills]]"
updated: 2026-11-10
---
The command surface of `boardry`, as implemented in `packages/cli/src/index.ts`.

Query:

- `boardry ask "<question>"` - ranked notes and their typed links.
- `boardry search "<term>"` - full-text search.
- `boardry show <path>` - print a note.
- `boardry links <path>` - edges out of and into a note.
- `boardry backlinks <path>` - notes that point at this one.

Layers:

- `boardry layers` - declared layers and note counts.
- `boardry brief` - the first layer, printed.
- `boardry components` - the second layer, titles only.
- `boardry fit <path>` - notes in the `ai` layer that mention the target.

Write:

- `boardry init [--layers a,b,c]` - create `index.md`, `.gitignore`, and the layer folders.
- `boardry add --layer <layer> [--title <title>]` - create an empty note.
- `boardry note "<title>" --layer <layer>` - create a note from stdin.
- `boardry link <a> <b> [--type <verb>]` - add a typed link.
- `boardry unlink <a> <b>` - remove links to the target.

Index and tools:

- `boardry index [-w]` - write `.boardry/.index/index.json`.
- `boardry check` - report orphans, broken links, and missing or unknown layers.
- `boardry status` - counts by layer, brainstorming count, and parse errors.
- `boardry serve [-p <port>]` - a read-only browser list.
- `boardry --version`.

Every command accepts `--path <dir>`.
