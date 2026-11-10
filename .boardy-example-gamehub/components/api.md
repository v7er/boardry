---
title: API
layer: components
component: api
kind: component
summary: The NestJS API in apps/server. It is the only service with business logic and the single source of truth.
links:
  - type: refines
    target: "[[vision]]"
  - type: contains
    target: "[[auth]]"
  - type: contains
    target: "[[tenancy]]"
  - type: contains
    target: "[[game-catalog]]"
  - type: contains
    target: "[[publishing]]"
  - type: contains
    target: "[[play-runtime]]"
  - type: contains
    target: "[[deployment]]"
  - type: contains
    target: "[[webhooks]]"
  - type: contains
    target: "[[leaderboard]]"
  - type: contains
    target: "[[openapi]]"
updated: 2026-11-10
---
The API server is `apps/server`, published as `@fzgame/server`. It is NestJS 11 on port 3020 and the only service with business logic. Both front ends are API clients.

`src/api.mod.ts` composes the application:

- `GlobalModule` for config, better-auth, ZenStack, events, mail, and shared services;
- `CommonModule`, `AuthModule`, `SpaceModule`, `UsersModule`;
- `AppModule`, `GameModule`, `GameInstanceModule`, `PlaySessionModule`, `LeaderboardModule`, `PlayerModule`;
- `WebhookModule`, `AssetModule`;
- `GitSourceModule`, `CiRunnerModule`, `DeploymentModule`.

Each module can expose up to four controller surfaces: `*.admin.ctrl.ts` for the back office, `*.portal.ctrl.ts` for the tenant portal, `*.sdk.ctrl.ts` for app-key callers, and `*.pub.ctrl.ts` or `*.runtime.ctrl.ts` for anonymous game and player traffic.

The API owns PostgreSQL through Prisma and ZenStack, object storage through S3 or MinIO, Redis for caching, and SMTP for mail. The game runtime, publishing, deployment, and webhook paths are described in their module notes.

The endpoint catalogue is in [[api-surface]]. The data rules are in [[zenstack]].
