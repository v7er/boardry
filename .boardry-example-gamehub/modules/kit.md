---
title: Kit
layer: modules
component: authoring
kind: module
summary: The zero-dependency runtime a game loads to resolve an instance, play, save state, and read the leaderboard.
links:
  - type: refines
    target: "[[authoring]]"
  - type: relates_to
    target: "[[game-pack]]"
  - type: relates_to
    target: "[[play-runtime]]"
  - type: relates_to
    target: "[[sdk-client]]"
updated: 2026-11-10
---
`@fzgame/kit` renders nothing. It keeps the session and config for a game that draws itself.

`createKit()` reads `apiUrl`, `gameInstanceId`, `playerToken`, `preview`, `gameSetting`, and `kit` from the query string. Missing `apiUrl` or `gameInstanceId` throws at construction; a missing `playerToken` throws at `connect()`.

| Call | Server |
| --- | --- |
| `load()` | `GET /pub/game-instances/:id` |
| `connect()` | `POST /games/runtime/sessions` |
| `emit(type, payload)` | `POST /games/runtime/sessions/:token/emit` |
| `setState(state)` | `PUT /games/runtime/sessions/:token/snapshot` |
| `getLeaderboard()` | `GET /pub/game-instances/:id/leaderboard/:board` |
| `config()` | local merge, no request |
| `snapshot` | local copy of the last session |

`kit.snapshot` is `{ status, score, result, state }`. It is refreshed after every call that returns a session. `connect()` hydrates `state` from the stored snapshot, which is how resume works.

`kit.config()` merges, in increasing priority: `formSchema` defaults, instance `overrides`, then `createKit` config or `?gameSetting`.

Preview mode `?preview=true` keeps every call in memory. It applies the same lifecycle rules as the server, but nothing is persisted and no handler runs unless the studio calls the handler test route.

The kit does not retry. A failed request rejects with `KitApiError` or `KitTimeoutError`. The default timeout is 30 seconds.

It also ships the editor helpers `onHostInit` and `postEditorSave`, the `fzgame-host` / `fzgame-editor` message constants, and `onHostSession` for a host that sends the player token or an existing session after the frame loads.

The pack is in [[game-pack]]. The server it talks to is in [[play-runtime]].
