---
title: npm packages
layer: technical
kind: decision
summary: Core and CLI publish to npm under the @boardry scope; the CLI package is @boardry/cli and installs the boardry command.
links:
  - type: affects
    target: "[[cli]]"
  - type: relates_to
    target: "[[stack]]"
updated: 2026-11-10
---
`@boardry/core` and `@boardry/cli` publish publicly to npm.

- `@boardry/core` is the engine: parser, graph, and search index.
- `@boardry/cli` is the CLI package. Its `bin` is `boardry`, so `npm install -g @boardry/cli` gives the `boardry` command. The package name is scoped; the command name is not.

Both set `publishConfig.access: public`, ship only `dist`, and build from `prepublishOnly`. From the repo root, `npm run publish:packages` publishes core first, then the CLI, because the CLI depends on core.

README and `docs/CLI.md` show the npm install path, and the docs site carries the same `npm i -g @boardry/cli` strip. Contributor setup stays pnpm: the monorepo uses workspace links, which npm does not install.

`apps/site` deploys to Cloudflare Pages, project `boardy` (boardy.pages.dev), not `boardry`.
