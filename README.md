# boardry

The document centre for your product. Layers you define in `index.md`, linked into one graph, with AI skills mapped onto every part.

## What it is

boardry keeps everything you know about a product in one folder, `.boardry/`, as plain markdown notes. A CLI, a desktop app (Studio), and AI agent skills all read and write the same files.

This repo ships a populated `.boardry/` that documents boardry itself: 13 notes across the brief, components, prototypes, modules, technical, and whitelist layers.

## Install

boardry is published to npm under the `@boardry` scope:

- [`@boardry/cli`](https://www.npmjs.com/package/@boardry/cli) - the `boardry` command.
- [`@boardry/core`](https://www.npmjs.com/package/@boardry/core) - the parser, graph, and search engine it runs on.

Requires Node.js 22 or newer. Install the CLI globally:

```bash
npm install -g @boardry/cli
```

Or run it without installing:

```bash
npx @boardry/cli index
```

## Quick start

```bash
boardry init                              # create .boardry/ with index.md
boardry index                             # build the graph index
boardry ask "how do refunds work"         # ranked notes and their links
```

## Using the CLI

```bash
boardry index
boardry ask "how do refunds work"
boardry check
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

Studio is the desktop app for the same folder. It is private and not published to npm:

```bash
cd apps/studio
npm run tauri dev
```

Open the project root (which contains `.boardry/`) or the `.boardry/` folder itself. Studio finds `.boardry/index.md` either way and draws the graph. Press Cmd-K to search, click a node to edit its note.

See [docs/STUDIO.md](./docs/STUDIO.md) for the feature list.

## Development

This repo is a pnpm monorepo. Requires pnpm, plus Rust and the Tauri prerequisites for Studio.

```bash
pnpm install
pnpm run build
```

## Publishing

Both packages publish to npm under the `@boardry` scope. Build first, then publish core before the CLI (the CLI depends on it):

```bash
npm run publish:packages
```

Each package also runs its build from `prepublishOnly`, so `npm publish` alone builds before it uploads. Studio and the site stay private.

## Docs

- [ARCHITECTURE.md](./ARCHITECTURE.md) - how the code is put together.
- [AGENTS.md](./AGENTS.md) - the package whitelist and rules for coding agents.
- [RULES.md](./RULES.md) - day-to-day rules.
- [docs/CLI.md](./docs/CLI.md), [docs/STUDIO.md](./docs/STUDIO.md), [docs/CORE.md](./docs/CORE.md) - per-part specs.

AI: read [AI_GUIDE.md](./AI_GUIDE.md) for the full specification.
