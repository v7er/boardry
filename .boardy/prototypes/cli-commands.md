---
title: CLI commands
layer: prototypes
component: cli
kind: interface
summary: The command surface of boardy, grouped by query, layers, write, index, and tooling.
links:
  - type: refines
    target: "[[cli]]"
  - type: relates_to
    target: "[[agent-skills]]"
updated: 2026-11-10
---
The command surface of `boardy`, as implemented in `packages/cli/src/index.ts`.

Query:

- `boardy ask "<question>"` - ranked notes and their typed links.
- `boardy search "<term>"` - full-text search.
- `boardy show <path>` - print a note.
- `boardy links <path>` - edges out of and into a note.
- `boardy backlinks <path>` - notes that point at this one.

Layers:

- `boardy layers` - declared layers and note counts.
- `boardy brief` - the first layer, printed.
- `boardy components` - the second layer, titles only.
- `boardy fit <path>` - notes in the `ai` layer that mention the target.

Write:

- `boardy init [--layers a,b,c]` - create `index.md`, `.gitignore`, and the layer folders.
- `boardy add --layer <layer> [--title <title>]` - create an empty note.
- `boardy note "<title>" --layer <layer>` - create a note from stdin.
- `boardy link <a> <b> [--type <verb>]` - add a typed link.
- `boardy unlink <a> <b>` - remove links to the target.

Index and tools:

- `boardy index [-w]` - write `.boardy/.index/index.json`.
- `boardy check` - report orphans, broken links, and missing or unknown layers.
- `boardy status` - counts by layer, brainstorming count, and parse errors.
- `boardy serve [-p <port>]` - a read-only browser list.
- `boardy --version`.

Every command accepts `--path <dir>`.
