---
title: Portal views
layer: prototypes
component: portal
kind: interface
summary: The tenant portal pages from the home catalog to the space studio and instance editor.
links:
  - type: refines
    target: "[[portal]]"
  - type: relates_to
    target: "[[brand]]"
updated: 2026-11-10
---
The portal is a Next.js app with a public catalog, an authenticated space studio, and an embedding sandbox.

| Route | Screen |
| --- | --- |
| `/` | home with hero and game sections |
| `/explorer` | public catalog explorer |
| `/spaces/[id]` | space dashboard |
| `/spaces/[id]/members` | membership and roles |
| `/spaces/[id]/settings` | space settings |
| `/spaces/[id]/webhooks` | space-level webhooks |
| `/spaces/[id]/apps` | app list |
| `/spaces/[id]/apps/create` | create app |
| `/spaces/[id]/apps/[appId]` | app detail: credentials, instances, players, sessions |
| `/spaces/[id]/apps/[appId]/instances/[instanceId]` | instance detail and play |
| `/spaces/[id]/apps/[appId]/instances/[instanceId]/editor` | instance editor iframe |
| `/spaces/[id]/games` | studio game list |
| `/spaces/[id]/games/create` | create a game from git |
| `/spaces/[id]/games/[gameId]` | game detail and deployments |
| `/spaces/[id]/games/[gameId]/deployments/[deploymentId]` | build log and promote |
| `/game-editor/sandbox` | game on the left, editor on the right, events below |
| `/preview/games/[id]` | public game preview with leaderboard |
| `/git-sources` | connected repositories |
| `/docs` | SDK and API docs |
| `/profile` | account profile |
| `/auth/set-password/[token]` | invited-user password set |
| `/policy/privacy`, `/policy/terms` | policy pages |

The space shell keeps the current space in scope. The app detail is the operational centre: it lists game instances, players, sessions, credentials, and webhooks for one app.

The game viewport rotates a `landscape` game with a CSS transform on coarse-pointer devices. The API only reports `viewMode`; presentation belongs to the host.
