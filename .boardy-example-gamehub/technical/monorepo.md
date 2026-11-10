---
title: Monorepo
layer: technical
kind: decision
summary: pnpm workspaces and Turborepo run three apps and five packages from one lockfile.
links:
  - type: affects
    target: "[[authoring]]"
  - type: relates_to
    target: "[[openapi-pipeline]]"
  - type: relates_to
    target: "[[known-gaps]]"
updated: 2026-11-10
---
GameHub is a pnpm workspace with Turborepo.

```text
apps/
  server/   @fzgame/server   NestJS API        :3020
  portal/   @fzgame/portal   Next 15, React 19 :3000
  bo/       @fzgame/bo       Next 14, React 18 :3003
packages/
  kit/      @fzgame/kit      in-game runtime
  cli/      @fzgame/cli      bin fzgame
  sdk/      @fzgame/sdk      typed server client
  eslint-config/
  typescript-config/
```

The root `package.json` declares `pnpm@9.0.0`, Node `>=18`, and the scripts `build`, `dev`, `lint`, `format`, `check-types`, `bump`, and `publish:all`. Each workspace has its own scripts, and `turbo run` fans them out.

The kit and CLI are public packages; the server, portal, and BO are private. The SDK is public. The eslint and TypeScript configs stay private at `0.0.0`.

A workspace change can invalidate generated types in another workspace. The OpenAPI pipeline is the main coupling; see [[openapi-pipeline]].
