# CLI

The `boardry` command line. Everything the CLI does, and the packages it uses.

## What it is

A single Node CLI, `boardry`, that reads and writes the `.boardry/` folder. It shares the core with Studio, so the CLI and the app never disagree about how a note is parsed or how a link is typed.

## Install

Published to npm as `@boardry/cli`, which installs the `boardry` command. Requires Node.js 22 or newer.

```bash
npm install -g @boardry/cli
```

Or run it without installing:

```bash
npx @boardry/cli index
```

## Features

### Query

- `boardry ask "<question>"` - ranked notes and their links, no LLM, no key.
- `boardry search "<term>"` - full-text search over notes.
- `boardry show <path>` - print a note.
- `boardry links <path>` - every edge into and out of a note.
- `boardry backlinks <path>` - every note that points at this one.

### Layers

- `boardry layers` - the layers from `index.md` and their notes, top to bottom.
- `boardry brief` - the first layer, the vision.
- `boardry components` - the components layer and submodules.
- `boardry fit <path>` - what LayerAI maps onto a note, module, or layer.

### Write

- `boardry add --layer <layer>` - open a template for a new note in a layer.
- `boardry link <a> <b> --type <verb>` - add a typed edge to both notes.
- `boardry unlink <a> <b>` - remove an edge.
- `boardry note "<title>" --layer <layer>` - add a note from text on stdin.

### Index and check

- `boardry init` - set up `.boardry/` with `index.md`, `.gitignore`, and the starter notes.
- `boardry index` - rebuild the graph index in `.boardry/.index/`.
- `boardry index --watch` - re-index as files change.
- `boardry check` - report orphans, broken links, and broken waterfall (exit 1 on a problem).

### Status and tools

- `boardry status` - note count, link count, and what changed since the last index.
- `boardry serve` - a local read-only graph viewer, no Tauri needed.
- `boardry --version`.

### Any folder

Every command takes `--path <dir>` to use a folder other than `.boardry`. Point it at either the notes folder or a project root that contains `.boardry`:

```bash
boardry index --path .boardry-example
boardry check --path .boardry-example
boardry ask "where are tasks stored" --path .boardry-example
```

The repo ships a runnable sample in `.boardry-example/`.

## Behavior

- `boardry ask`, `boardry search`, `boardry layers`, and `boardry fit` are deterministic. They never call a model and never need a key.
- Ranking is by text match and by graph connectivity, so a note many others point at ranks higher.
- `boardry` reads the folder directly and only rebuilds what changed, so the index stays current with uncommitted edits.
- Notes marked `type: brainstorming` are skipped and never surface in answers.

## Tech

- `commander` for commands and flags.
- `@clack/prompts` for interactive prompts.
- `chalk` for terminal output.
- `fast-glob` to discover notes.
- `chokidar` to watch for changes.
- `sirv` for the local viewer behind `boardry serve`.
- `tsup` bundles the CLI into a single file.
- File access uses Node `fs`, injected through the core's seam.

Published as `@boardry/cli`.
