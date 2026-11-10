---
title: Play runtime
layer: modules
component: api
kind: module
summary: Connect or resume a session, move the lifecycle, store snapshots, and expire stale rounds.
links:
  - type: refines
    target: "[[api]]"
  - type: relates_to
    target: "[[session-lifecycle]]"
  - type: relates_to
    target: "[[handler-vm]]"
  - type: relates_to
    target: "[[players]]"
  - type: relates_to
    target: "[[game-instance]]"
updated: 2026-11-10
---
The runtime is anonymous and keyed by the play URL. `GameRuntimeService` is the only writer.

## Connect or resume

`POST /games/runtime/sessions` takes `{ gameInstanceId, playerToken }`. It loads a `PUBLISHED` instance, finds the player by `(appId, identity)`, and returns the newest live session for that player and instance. If none exists it creates a `CREATED` session with a 24-hour `expiresAt`.

A terminal session is not resumed. `FINISHED`, `ABORTED`, and `EXPIRED` start a new round on the next connect.

## Emit

`POST /games/runtime/sessions/{token}/emit` takes `{ type, payload }`. `resolveEmit` maps the event:

| Event | Effect |
| --- | --- |
| `ready` | `READY` |
| `start` | `PLAYING`, first `startedAt` only |
| `pause` | `PAUSED` |
| `finish` | `FINISHED`, stores score and result, runs the handler |
| `abort` | `ABORTED` |
| `score` | keeps status, stores score and result |
| `snapshot` | keeps status, stores `metadata.snapshot` |
| any other string | keeps status, stores `metadata.lastEvent` |

Illegal moves throw. `FINISHED`, `ABORTED`, and `EXPIRED` accept nothing.

## Snapshot

`PUT /games/runtime/sessions/{token}/snapshot` is sugar for `emit('snapshot', { state })`. The state lands in `metadata.snapshot` and comes back on the next connect, which is how resume restores progress.

## Expiry

`PlaySessionService` sweeps every 60 seconds and marks sessions past `expiresAt` as `EXPIRED`. Terminal sessions and sessions without an expiry are left alone. The sweep runs on the base Prisma client because it spans every space.

## Preview

`?preview=true` never reaches the server. The kit keeps `load`, `connect`, `emit`, and `setState` in memory. On finish, the studio can still call `POST /games/runtime/handler` with a local source or a published game id and show the return value.

The state machine is in [[session-lifecycle]]. The handler is in [[handler-vm]].
