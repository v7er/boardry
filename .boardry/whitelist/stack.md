---
title: Package whitelist
layer: whitelist
kind: whitelist
summary: The allowed stack from AGENTS.md. Pick from it and ask before adding anything outside it.
links:
  - type: affects
    target: "[[core]]"
  - type: affects
    target: "[[cli]]"
  - type: affects
    target: "[[studio]]"
updated: 2026-11-10
---
The allowed stack, copied from `AGENTS.md`. Pick from it, do not reach outside it without asking, and do not build from scratch what a listed package already does.

Toolchain:

- TypeScript, strict mode
- Node.js 22 or newer
- pnpm monorepo
- turbo
- Rust, only the Tauri scaffold

Core:

- unified, remark-parse, remark-gfm, remark-wiki-link, remark-frontmatter
- yaml, graphology, minisearch, zod

CLI:

- commander, @clack/prompts, chalk, fast-glob, chokidar, sirv, tsup

Studio:

- @tauri-apps/api and the fs, dialog, store, and shell plugins
- React 19, Vite
- @xyflow/react, d3-force
- @mdxeditor/editor
- react-markdown, remark-gfm, remark-wiki-link
- zustand
- @mantine/core, @mantine/hooks, @mantine/form, @mantine/notifications
- @tabler/icons-react
- postcss-preset-mantine

Quality:

- eslint, prettier, vitest

The manifest has two packages outside this list. See [[package-drift]].
