# AGENTS.md

Read this file, people and agents alike. It says what this project is, how the code is laid out, and which packages are allowed. If a tool is not on the whitelist below, do not add it without asking.

## The project

boardy is a document centre for a product. It keeps the project's knowledge in a `.boardy/` folder of markdown notes, organized in layers that an `index.md` declares, linked into one graph. A CLI, agent skills, and a Tauri Studio app read and write the same folder.

Read [README.md](./README.md) for setup, [AI_GUIDE.md](./AI_GUIDE.md) for the full specification, [ARCHITECTURE.md](./ARCHITECTURE.md) for how the code is put together, and [RULES.md](./RULES.md) for the day-to-day rules.

## Layout

```text
.
  packages/core/   the pure TypeScript graph engine and parser, no file I/O
  packages/cli/    the Node CLI (boardy)
  apps/studio/        the Tauri 2 + React desktop app
  skills/             agent skill files
  .boardy/    the notes (data, not code)
```

## The package whitelist

This is the allowed stack. The packages publish under the `@boardy` scope (`@boardy/core`, `@boardy/cli`). Pick from it, do not reach outside it without asking, and do not rewrite from scratch what a listed package already does.

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
- @uiw/react-codemirror
- @codemirror/lang-markdown
- @codemirror/lang-yaml
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

1. **Read the notes first.** Before answering a question or changing code, read the relevant notes in `.boardy/`. Use the CLI (`boardy ask`, `boardy fit`) when it is available.
2. **Search the whitelist first.** Check the list above before reaching for anything. If the package you need is not listed, do not install it. Ask the user first, using the ask tool: name the package and why you need it, then wait for an answer.
3. **Do not build from scratch.** If a listed package already does the job, use it. A markdown parser, a graph library, a full-text index, and a file watcher are already covered.
4. **Write a note when an aspect is done.** A decision, component, or convention goes into `.boardy/` as a note in the right layer when it is finished, not before. Never edit an existing note without being asked.
5. **Keep the core pure.** `packages/core` does no file I/O. It takes text in and returns a graph and an index. The CLI and Studio inject their own file access.
6. **Keep it readable for people.** This is a document centre for humans. Write code and notes a person can follow, not just an AI.
7. **Ignore brainstorming notes.** A note with `type: brainstorming` is a human's free text. Do not read it, link it, quote it, or build on it. It is not part of the graph.

## Conventions

- pnpm, not npm or yarn.
- TypeScript strict. No `any` without a reason written down.
- Every note carries a `layer` field (a name from `index.md`), and a `component` field where it applies.
- Commit `.boardy/`. Keep the derived `.boardy/.index/` index out of git.
