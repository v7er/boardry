# ARCHITECTURE.md

How boardry is put together, and where each whitelisted package is used.

## Overview

boardry is a document centre. The source of truth is `.boardry/`, a folder of markdown notes. Everything else reads and writes that folder.

Three programs share one TypeScript core:

- `packages/core` parses notes and builds the graph and the index.
- `packages/cli` runs the core in Node, as the `boardry` command.
- `apps/studio` runs the core in a Tauri window, as the desktop app.

The core is pure. It takes text in and returns a graph and an index, and it never reads the file system. Each program injects its own file access, so the same core runs unchanged in both.

## The pieces

```text
.boardry/        the notes, markdown, the source of truth
        |
        v
packages/core        parse + graph + index (pure TypeScript)
        |
        +-- packages/cli      Node: read and write files, search, check
        +-- apps/studio          Tauri: read and write files, draw and edit the graph
```

## Data flow

1. `index.md` at the root declares the layers and their order.
2. A note is a markdown file with YAML frontmatter.
3. `core` parses each note, reads its `layer`, `component`, `kind`, and `links` fields, and finds `[[wikilinks]]` in the body.
4. It builds a graph (nodes are notes, edges are typed links) and a full-text index.
5. The CLI and Studio query the graph and index, and write back plain markdown.

Notes marked `type: brainstorming` are skipped when the graph and index are built. They stay plain text for the human and never reach AI.

The graph and the index are derived data. They are rebuilt from the notes and never edited by hand. The `.boardry/.index/` folder holds the cached index and stays out of git.

## The file access seam

The core depends on one narrow interface, the file access it does not do itself:

```text
read(path)        -> text
write(path, text) -> void
list(dir)         -> paths
watch(dir, cb)    -> unwatch
```

- The CLI implements it with Node `fs`, `fast-glob`, and `chokidar`.
- Studio implements it with `@tauri-apps/plugin-fs` and its own watchers.

Because the seam is small, the parser, graph, and index never know which program is running them.

## Whitelist package usage

The full allowed stack, with what each package does and where it lives. The packages publish under the `@boardry` scope (`@boardry/core`, `@boardry/cli`).

| Package | Where | What it does |
|---|---|---|
| TypeScript | all | the language, strict mode |
| Node.js 22+ | cli, tooling | the CLI runtime |
| pnpm | all | package manager for the monorepo |
| turbo | all | run build, test, and lint across packages |
| Rust | studio | the Tauri scaffold only, nothing hand-written |
| unified | core | the parse pipeline driver |
| remark-parse | core | markdown into a syntax tree |
| remark-gfm | core | tables, strikethrough, task lists |
| remark-wiki-link | core | find `[[wikilinks]]` |
| remark-frontmatter | core | split off the YAML frontmatter |
| yaml | core | parse the frontmatter |
| graphology | core | in-memory graph: nodes, edges, traversal |
| minisearch | core | full-text index and ranking |
| zod | core | validate frontmatter against the schemas |
| commander | cli | commands and flags |
| @clack/prompts | cli | interactive prompts |
| chalk | cli | terminal colors |
| fast-glob | cli | find note files |
| chokidar | cli | watch for changes |
| sirv | cli | serve the local viewer |
| tsup | cli | bundle the CLI |
| @tauri-apps/api | studio | Tauri's JavaScript API |
| @tauri-apps/plugin-fs | studio | read and write notes |
| @tauri-apps/plugin-dialog | studio | open and save dialogs |
| @tauri-apps/plugin-store | studio | persist the AI provider settings |
| @tauri-apps/plugin-shell | studio | open a note in an external editor |
| React 19 | studio | the UI framework |
| Vite | studio | the build tool |
| @mantine/core | studio | components and styling |
| @mantine/hooks | studio | utility hooks |
| @mantine/form | studio | form state for settings |
| @mantine/notifications | studio | toasts |
| @tabler/icons-react | studio | icons |
| postcss-preset-mantine | studio | Mantine's build setup |
| @xyflow/react | studio | the graph and waterfall views |
| d3-force | studio | the force layout |
| @uiw/react-codemirror | studio | the markdown editor |
| @codemirror/lang-markdown | studio | markdown highlighting |
| @codemirror/lang-yaml | studio | frontmatter highlighting |
| react-markdown | studio | live preview |
| remark-gfm | studio | preview tables and lists |
| remark-wiki-link | studio | preview wikilinks |
| zustand | studio | app state |
| eslint | all | lint |
| prettier | all | format |
| vitest | all | tests |

## Layers and the folder

The layers are data, not code. An `index.md` at the root of `.boardry/` declares which folders are layers and their order. `core` reads `index.md`, then keys each note by its `layer` field, not by directory. The folders are a convenience for people.

```text
.boardry/
  .gitignore          ignores .index/
  index.md            declares the layers and their order
  brief.md            layer: brief
  components/         layer: components
  prototypes/         layer: prototypes
  modules/            layer: modules
  technical/          layer: technical
  whitelist.md        layer: whitelist
  ai/                 LayerAI
  .index/             the derived index, gitignored
```

## Studio and the CLI

Both surfaces do the same three things: read the folder, run the core, show the result. The CLI prints it as text. Studio draws it as a graph and a waterfall, and lets you edit a note in place. Neither keeps its own copy of the graph; each asks the core, which asks the folder.
