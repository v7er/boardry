# CLI

The `boardy` command line. Everything the CLI does, and the packages it uses.

## What it is

A single Node CLI, `boardy`, that reads and writes the `.boardy/` folder. It shares the core with Studio, so the CLI and the app never disagree about how a note is parsed or how a link is typed.

## Features

### Query

- `boardy ask "<question>"` - ranked notes and their links, no LLM, no key.
- `boardy search "<term>"` - full-text search over notes.
- `boardy show <path>` - print a note.
- `boardy links <path>` - every edge into and out of a note.
- `boardy backlinks <path>` - every note that points at this one.

### Layers

- `boardy layers` - the layers from `index.md` and their notes, top to bottom.
- `boardy brief` - the first layer, the vision.
- `boardy components` - the components layer and submodules.
- `boardy fit <path>` - what LayerAI maps onto a note, module, or layer.

### Write

- `boardy add --layer <layer>` - open a template for a new note in a layer.
- `boardy link <a> <b> --type <verb>` - add a typed edge to both notes.
- `boardy unlink <a> <b>` - remove an edge.
- `boardy note "<title>" --layer <layer>` - add a note from text on stdin.

### Index and check

- `boardy init` - set up `.boardy/` with `index.md`, `.gitignore`, and the starter notes.
- `boardy index` - rebuild the graph index in `.boardy/.index/`.
- `boardy index --watch` - re-index as files change.
- `boardy check` - report orphans, broken links, and broken waterfall (exit 1 on a problem).

### Status and tools

- `boardy status` - note count, link count, and what changed since the last index.
- `boardy serve` - a local read-only graph viewer, no Tauri needed.
- `boardy --version`.

### Any folder

Every command takes `--path <dir>` to use a folder other than `.boardy`. Point it at either the notes folder or a project root that contains `.boardy`:

```bash
boardy index --path .boardy-example
boardy check --path .boardy-example
boardy ask "where are tasks stored" --path .boardy-example
```

The repo ships a runnable sample in `.boardy-example/`.

## Behavior

- `boardy ask`, `boardy search`, `boardy layers`, and `boardy fit` are deterministic. They never call a model and never need a key.
- Ranking is by text match and by graph connectivity, so a note many others point at ranks higher.
- `boardy` reads the folder directly and only rebuilds what changed, so the index stays current with uncommitted edits.
- Notes marked `type: brainstorming` are skipped and never surface in answers.

## Tech

- `commander` for commands and flags.
- `@clack/prompts` for interactive prompts.
- `chalk` for terminal output.
- `fast-glob` to discover notes.
- `chokidar` to watch for changes.
- `sirv` for the local viewer behind `boardy serve`.
- `tsup` bundles the CLI into a single file.
- File access uses Node `fs`, injected through the core's seam.

Published as `@boardy/cli`.
