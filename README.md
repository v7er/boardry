# boardry

The document centre for your product. Layers you define in `index.md`, linked into one graph, with AI skills mapped onto every part.

## What it is

boardry keeps everything you know about a product in one folder, `.boardry/`, as plain markdown notes. A CLI, a desktop app (Studio), and AI agent skills all read and write the same files.

This repo ships a populated `.boardry/` that documents boardry itself: 13 notes across the brief, components, prototypes, modules, technical, and whitelist layers.

## Setup

Requirements: Node.js 22 or newer and pnpm. For Studio, also Rust (cargo) and the Tauri prerequisites for your operating system.

```bash
pnpm install
pnpm run build
```

## Using the CLI

```bash
node packages/cli/dist/index.js index            # build .boardry/.index/
node packages/cli/dist/index.js ask "how do refunds work"
node packages/cli/dist/index.js check
```

Or through pnpm from the repo root:

```bash
pnpm run cli index
```

Common commands:

- `init` - set up `.boardry/` with `index.md` and `.gitignore`.
- `index` - rebuild the derived index in `.boardry/.index/`.
- `ask <question>` - ranked notes and their links.
- `search <term>` - full-text search.
- `layers` - list the layers.
- `check` - orphans, broken links, and broken waterfall.
- `status` - note and link counts.
- `serve` - a local read-only viewer.

See [docs/CLI.md](./docs/CLI.md) for every command.

## The knowledge base

`index.md` declares the layers and their order. Each note is a markdown file with frontmatter (`title`, `layer`, `component`, `kind`, `links`) written into its layer folder. The default layers:

- `brief` - the vision.
- `components` - the top-level parts (core, CLI, Studio).
- `prototypes` - the interfaces (CLI commands, Studio views).
- `modules` - finer units inside a component (parser, graph, search index).
- `technical` - decisions.
- `whitelist` - the allowed libraries.

A note with `type: brainstorming` is free text for a human, ignored by the graph and by AI.

`boardry index` writes the derived index to `.boardry/.index/` (gitignored). The markdown is always the source of truth.

## Using Studio

Studio is the desktop app for the same folder:

```bash
pnpm --filter @boardry/studio run tauri dev
```

Open the project root (which contains `.boardry/`) or the `.boardry/` folder itself. Studio finds `.boardry/index.md` either way and draws the graph. Press Cmd-K to search, click a node to edit its note.

See [docs/STUDIO.md](./docs/STUDIO.md) for the feature list.

## Docs

- [ARCHITECTURE.md](./ARCHITECTURE.md) - how the code is put together.
- [AGENTS.md](./AGENTS.md) - the package whitelist and rules for coding agents.
- [RULES.md](./RULES.md) - day-to-day rules.
- [docs/CLI.md](./docs/CLI.md), [docs/STUDIO.md](./docs/STUDIO.md), [docs/CORE.md](./docs/CORE.md) - per-part specs.

AI: read [AI_GUIDE.md](./AI_GUIDE.md) for the full specification.
