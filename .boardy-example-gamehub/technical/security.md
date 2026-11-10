---
title: Security boundaries
layer: technical
kind: decision
summary: App secrets stay server-side, the runtime identity is a bearer value, and webhooks are HMAC signed.
links:
  - type: affects
    target: "[[api]]"
  - type: relates_to
    target: "[[auth]]"
  - type: relates_to
    target: "[[webhooks]]"
  - type: relates_to
    target: "[[known-gaps]]"
updated: 2026-11-10
---
The trust boundaries are:

- **App credentials.** `x-app-key` plus `x-app-secret` authorize an app. The secret is hashed at rest and returned once on create or rotate. It belongs on the customer's server, never in a browser bundle.
- **Player identity.** The runtime is anonymous and keys the player by the `playerToken` in the play URL. That value is `AppPlayer.identity`. Anyone who knows it can act as that player until a signed per-player token replaces it. This is the largest known gap.
- **Operator routes.** `OperatorGuard` reads the better-auth session and checks `UserKind.OPERATOR`. A tenant session cannot reach `/admin/*`.
- **Tenant routes.** `SpaceUserGuard` reads the session, requires `x-space-id`, and checks membership and role. The ZenStack policy re-checks the row.
- **App routes.** `AppGuard` resolves the credential to one app and space. The caller cannot choose a different space.
- **Webhooks.** A hook with a secret signs the exact body with HMAC-SHA256 over `timestamp.body`. The consumer should verify the signature and reject an old timestamp to stop replay.
- **Game code.** The handler runs in a QuickJS isolate with no `process`, `require`, or network, 1 second, 8 MB, and a 128 KB source cap.
- **Public instance detail.** It omits `unlockToken` and the relation lists. The public surface is the game, the resolved URL, the overrides, and the editor URL.

The dev server `fzgame dev` has open CORS and no auth. It binds `127.0.0.1` by default; `--host 0.0.0.0` exposes the mock runtime on the LAN.

The identity gap and the missing signed token are in [[known-gaps]].
