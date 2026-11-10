---
title: Known gaps
layer: technical
kind: observation
summary: Current limits that matter before treating the code as the whole truth.
links:
  - type: affects
    target: "[[api]]"
  - type: affects
    target: "[[portal]]"
  - type: affects
    target: "[[bo]]"
  - type: affects
    target: "[[authoring]]"
  - type: relates_to
    target: "[[security]]"
  - type: relates_to
    target: "[[session-lifecycle]]"
updated: 2026-11-10
---
Observed in the current tree, not planned work:

- **Runtime identity is a bearer value.** The play URL carries the player's `identity` and the runtime trusts it. Treat a player token as impersonatable until a signed per-player token replaces it.
- **No session history endpoint.** `GET /sdk/sessions/active` returns the newest live session of one player. A "past rounds" screen needs another surface.
- **The Redis WebSocket adapter is commented out** in `src/main.ts`. Realtime currently relies on the runtime HTTP endpoints and webhooks.
- **The checked-in SDK schema is behind.** It predates the `/sdk/sessions` paths and declares only 401 and 403 for the session and login routes, so the typed responses are empty until the spec and the client are regenerated.
- **The publish status in the older diagram is wrong.** `publisher.srv.ts` sets `status: ACTIVED` on a zip publish; the architecture diagram says `DRAFT`. The code wins.
- **The git manifest default is suspicious.** `GitSource.manifestPath` defaults to `gamehub.json`, while the docs and CLI use `fzgame.json`. Check the import path if a git source cannot find the manifest.
- **Billing is not implemented.** `SPACE_CREATION_REQUIRES_PAYMENT` can return 402, but there is no Stripe module in `src`.
- **Portal types are React 18 while the runtime is React 19.** `apps/portal/package.json` pins `@types/react` 18.2 with React 19.1. That can produce type friction, not a runtime failure.

The security gap is in [[security]]. The lifecycle limits are in [[session-lifecycle]].
