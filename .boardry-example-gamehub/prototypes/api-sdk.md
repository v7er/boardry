---
title: SDK API
layer: prototypes
component: api
kind: interface
summary: The 30 app-key operations a customer backend uses to list games, identify players, and manage sessions.
links:
  - type: refines
    target: "[[api]]"
  - type: relates_to
    target: "[[sdk-client]]"
  - type: relates_to
    target: "[[play-runtime]]"
updated: 2026-11-10
---
The SDK surface is the `*.sdk.ctrl.ts` group, plus the anonymous runtime and public routes the game calls. Every `/sdk/*` request uses `x-app-key` and `x-app-secret` and resolves to an `AppCtx` bound to one app and one space.

The generated `openapi-sdk.json` has **30 operations on 27 paths**:

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/sdk/app/current` | the app behind the key |
| GET | `/sdk/game-instances` | published instances for the app, with the game |
| GET | `/sdk/game-instances/{id}` | one published instance |
| POST | `/sdk/login` | identify or create a player |
| GET, PUT, DELETE | `/sdk/players/{id}` | player profile |
| POST | `/sdk/players/{id}/logout` | expire every live session |
| POST | `/sdk/sessions` | create a session from the host |
| GET | `/sdk/sessions/active` | newest live session, or null |
| GET, PUT | `/sdk/sessions/{token}` | read or update a session |
| POST | `/sdk/sessions/{token}/start` | start |
| POST | `/sdk/sessions/{token}/pause` | pause |
| POST | `/sdk/sessions/{token}/resume` | resume |
| POST | `/sdk/sessions/{token}/finish` | finish and run the handler |
| POST | `/sdk/sessions/{token}/abort` | abort |
| POST | `/sdk/sessions/{token}/score` | update score |

The document also includes the anonymous routes the iframe needs:

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/games/runtime/sessions` | create or resume from the play URL |
| GET | `/games/runtime/sessions/{token}` | read a session |
| POST | `/games/runtime/sessions/{token}/emit` | lifecycle event |
| PUT | `/games/runtime/sessions/{token}/snapshot` | save state |
| POST | `/games/runtime/handler` | studio handler test |
| GET | `/pub/game-instances/{id}` | public instance detail |
| GET | `/pub/categories`, `/pub/categories/{id}/games` | public catalog |
| GET | `/pub/game-instances/{id}/leaderboard/players`, `sessions` | instance boards |
| GET | `/pub/games/{id}/leaderboard/players`, `sessions` | game-wide boards |

## Host flow

The customer backend holds the app secret and does the following:

1. `GET /sdk/game-instances` returns only `PUBLISHED` instances, each with `game`. Read `game.configSchema.viewMode` for orientation.
2. `POST /sdk/login` upserts on `(appId, identity)` and returns the player. The `identity` is the host's own user id and becomes the `playerToken`.
3. Build the play URL: `{resolvedUrl}?apiUrl=...&gameInstanceId=...&playerToken=...`. Optionally add `gameSetting` with the instance overrides.
4. The game calls `POST /games/runtime/sessions`. The host does not create the session and does not pass the app secret into the frame.
5. Before loading the frame, a continue screen can call `GET /sdk/sessions/active?playerId=...&gameInstanceId=...` and get `{ session }` or `null`.
6. If the frame is already loaded and the host has a `playSessionToken`, it posts the kit `session` message. `kit.applyHostSession()` adopts it.

`playerId` is the `AppPlayer.id`; `playerToken` is `AppPlayer.identity`. They are different values.

## Error shape

The SDK client does not throw on HTTP errors. `openapi-fetch` returns `{ data, error }`; the error carries the status and parsed body. The generated schema for the session routes is incomplete in the checked-in copy, so those typed responses are empty until the server document and the client types are regenerated. See [[known-gaps]].
