---
title: API surface
layer: prototypes
component: api
kind: interface
summary: The four controller audiences, the generated documents, and the route families of the 240-operation API.
links:
  - type: refines
    target: "[[api]]"
  - type: relates_to
    target: "[[api-game]]"
  - type: relates_to
    target: "[[api-sdk]]"
  - type: relates_to
    target: "[[openapi]]"
updated: 2026-11-10
---
The API is partitioned by audience, not by URL prefix alone. The controller file name decides which OpenAPI document a route lands in.

| Controller suffix | Audience | Guard | Document |
| --- | --- | --- | --- |
| `*.admin.ctrl.ts` | back office | `OperatorGuard` | `openapi-admin.json` |
| `*.portal.ctrl.ts` | tenant portal | `SpaceUserGuard` plus `x-space-id` | `openapi-portal.json` |
| `*.sdk.ctrl.ts` | customer backend | `AppGuard` plus `x-app-key` / `x-app-secret` | `openapi-sdk.json` |
| `*.pub.ctrl.ts`, `*.runtime.ctrl.ts` | games and players | anonymous | union document |

The current generated union has **192 paths and 240 operations**. The families are:

| Family | Operations | Tags |
| --- | --- | --- |
| Identity and account | 54 | Auth, Email OTP, JWT, multi-session, two-factor |
| Game domain | 111 | App, Asset, Game, GameCategory, GameInstance, GameRuntime, Leaderboard, PlaySession, Player, Webhook |
| Delivery | 51 | CiRunner, Deployment, GitConnector, GitSource, GitWebhook |
| Tenancy and operators | 24 | Space, User |

The two route families that matter most for a product question are:

- the game and play domain in [[api-game]];
- the app-key SDK in [[api-sdk]].

The generated documents are in `apps/server/public/`. The union is `openapi.json`; the SDK document is also mirrored byte-for-byte as `reference.json` so `@fzgame/sdk` has a stable URL.

Swagger UI is at `/swagger` and the raw document at `/swagger/json`.

The generation pipeline is in [[openapi]].
