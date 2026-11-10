# AGENTS.md

Read this file, people and agents alike. It says what this project is, how the code is laid out, and which packages are allowed. If a tool is not on the whitelist below, do not add it without asking.

## The project

boardry is a document centre for a product. It keeps the project's knowledge in a `.boardry/` folder of markdown notes, organized in layers that an `index.md` declares, linked into one graph. A CLI, agent skills, and a Tauri Studio app read and write the same folder.

Read [README.md](./README.md) for setup, [AI_GUIDE.md](./AI_GUIDE.md) for the full specification, [ARCHITECTURE.md](./ARCHITECTURE.md) for how the code is put together, and [RULES.md](./RULES.md) for the day-to-day rules.

## Layout

```text
.
  packages/core/   the pure TypeScript graph engine and parser, no file I/O
  packages/cli/    the Node CLI (boardry)
  apps/studio/        the Tauri 2 + React desktop app
  skills/             agent skill files
  .boardry/    the notes (data, not code)
```

## The package whitelist

This is the allowed stack. The packages publish under the `@boardry` scope (`@boardry/core`, `@boardry/cli`). Pick from it, do not reach outside it without asking, and do not rewrite from scratch what a listed package already does.

### Toolchain

- TypeScript, strict mode
- Node.js 22 or newer
- pnpm monorepo (`pnpm-workspace.yaml`)
- turbo
- Rust, only the Tauri scaffold, nothing written by hand

### Core (packages/core)

- unified
- remark-parse
- remark-gfm
- remark-wiki-link
- remark-frontmatter
- yaml
- graphology
- minisearch
- zod

### CLI (packages/cli)

- commander
- @clack/prompts
- chalk
- fast-glob
- chokidar
- sirv
- tsup

### Studio (apps/studio)

- @tauri-apps/api
- @tauri-apps/plugin-fs
- @tauri-apps/plugin-dialog
- @tauri-apps/plugin-store
- @tauri-apps/plugin-shell
- React 19
- Vite
- @xyflow/react
- d3-force
- @mdxeditor/editor
- react-markdown
- remark-gfm
- remark-wiki-link
- zustand
- @mantine/core
- @mantine/hooks
- @mantine/form
- @mantine/notifications
- @tabler/icons-react
- postcss-preset-mantine

### Quality

- eslint
- prettier
- vitest

## Rules for coding

1. **Read the notes first.** Before answering a question or changing code, read the relevant notes in `.boardry/`. Use the CLI (`boardry ask`, `boardry fit`) when it is available.
2. **Search the whitelist first.** Check the list above before reaching for anything. If the package you need is not listed, do not install it. Ask the user first, using the ask tool: name the package and why you need it, then wait for an answer.
3. **Do not build from scratch.** If a listed package already does the job, use it. A markdown parser, a graph library, a full-text index, and a file watcher are already covered.
4. **Write a note when an aspect is done.** A decision, component, or convention goes into `.boardry/` as a note in the right layer when it is finished, not before. Never edit an existing note without being asked.
5. **Keep the core pure.** `packages/core` does no file I/O. It takes text in and returns a graph and an index. The CLI and Studio inject their own file access.
6. **Keep it readable for people.** This is a document centre for humans. Write code and notes a person can follow, not just an AI.
7. **Ignore brainstorming notes.** A note with `type: brainstorming` is a human's free text. Do not read it, link it, quote it, or build on it. It is not part of the graph.

## Conventions

- pnpm, not npm or yarn.
- TypeScript strict. No `any` without a reason written down.
- Every note carries a `layer` field (a name from `index.md`), and a `component` field where it applies.
- Commit `.boardry/`. Keep the derived `.boardry/.index/` index out of git.

<!-- trail:start -->
## Trail — repo context graph

This repo is indexed in `.trail/cache/`: small linked markdown nodes that explain each
system and carry exact file:line spans, kept in sync with the code through git.

For ANY task here — understanding how something works, finding where code lives,
or scoping a change — get context from the graph before grepping or opening
source files. Re-ask freely (it's cheap) and reuse literal identifiers you
already have (symbol, error string, file name) as the query. New to this repo?
Run `trail map` first — a token-budgeted orientation (dir clusters, hubs,
hotspots), no LLM, no key.

- Run `trail ask "<your question>" --source` → ranked nodes with the relevant
  code spans inlined (each hit's ≤8-line crux by default; `--full` for whole
  definitions when the crux isn't enough). Match the tool to the task shape:
  for understanding or editing, the top node IS the answer — cite its
  `covers:` file:line spans and edit straight from `--source`. For
  exhaustive tasks ("every occurrence / every caller of this pattern"), ranked
  results are top-N, not complete — run `trail grep "<literal>"` instead
  (exhaustive over indexed files, grouped by enclosing symbol), falling back
  to raw `grep -rn` only for unindexed files.
- `trail skeleton <file>` → every definition's signature + span, ~10× cheaper
  than reading the file; use it to skim an API surface.
- `trail callers <symbol>` gives precomputed, exact edges — who calls this.
  Add `--direction out` for what it calls, or `--depth N` to walk
  transitively for the full blast radius. For structural questions, skip
  ranking and use this directly.
- Or browse: `.trail/cache/INDEX.md` lists every node; follow the links.
- Monorepos and folders of multiple repos rank fairly across sub-projects —
  hits carry `[scope/]` labels naming which one they're from. Narrow with
  `trail ask "<task>" --in <scope>/` once you know where you're working.

If a returned span is truncated ("+N more lines"), open the file at that exact
range before finalizing. Only open source files when a node genuinely lacks a
needed detail, and then at the exact file:line the node points to — never
re-read whole files.

After big code changes, refresh the graph with `trail build` (deterministic,
no API key, $0).
<!-- trail:end -->
