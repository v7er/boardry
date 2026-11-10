---
title: Session lifecycle
layer: technical
kind: decision
summary: The server owns the state machine, and both the runtime emit and the SDK routes use the same transition table.
links:
  - type: affects
    target: "[[play-runtime]]"
  - type: relates_to
    target: "[[known-gaps]]"
updated: 2026-11-10
---
Decision: a play session is a server-owned state machine. The client reports events; the server decides the status.

`src/game/lifecycle.ts` is the one transition table:

| From | Allowed to |
| --- | --- |
| `CREATED` | `READY`, `PLAYING`, `ABORTED`, `EXPIRED` |
| `READY` | `PLAYING`, `ABORTED`, `EXPIRED` |
| `PLAYING` | `PAUSED`, `FINISHED`, `ABORTED`, `EXPIRED` |
| `PAUSED` | `PLAYING`, `FINISHED`, `ABORTED`, `EXPIRED` |
| `FINISHED` | nothing |
| `ABORTED` | nothing |
| `EXPIRED` | nothing |

A same-status emit is a no-op. A custom event is accepted only in an active status and leaves the status alone. A `finish` or `abort` is terminal, so a terminal session is not resumed.

The SDK's `PUT /sdk/sessions/{token}` and the runtime `emit` both call `canTransition`. That prevents a host from forcing a status the game could not reach.

`EXPIRED` is set by the 24-hour TTL sweep, not by an emit. A session with no `expiresAt` is left alone.

Preview sessions in the kit use an in-memory copy of the same rules. They do not persist.

The runtime is in [[play-runtime]]. The open gaps around history and identity are in [[known-gaps]].
