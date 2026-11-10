---
title: Handler VM
layer: modules
component: api
kind: module
summary: The QuickJS isolate that turns a finish payload into stored score and result.
links:
  - type: refines
    target: "[[api]]"
  - type: relates_to
    target: "[[play-runtime]]"
  - type: relates_to
    target: "[[storage]]"
updated: 2026-11-10
---
On a real `finish`, the server loads `handler/index.js` from the game's `backendUrl` and runs it in a QuickJS isolate.

The isolate has:

- no `process`, no `require`, no network;
- a 1 second timeout;
- 8 MB of memory;
- a 128 KB source cap.

The handler exports a function or an object:

```js
export default function onFinish(payload) {
  return { score: 0, result: {} }
}
// or
export default { onFinish }
```

The payload is:

```js
{
  score,                    // from emit('finish')
  result,                   // from the game
  config,                   // instance overrides
  session: { id, token, playerId, gameInstanceId, appId, spaceId }
}
```

A numeric return `score` replaces the client score. A returned `result` replaces the client result. If the returned object has no `result` key, the whole object becomes the result.

A handler error keeps the client payload and stores `metadata.handlerError`. The session still finishes. The studio test route is `POST /games/runtime/handler` and runs the same code without a persisted session.

Sources are cached in memory: at most 64 entries and 8 MB. Oversized sources still reach the VM so the caller sees the size error, but they are not cached.

The source comes from [[storage]]. The lifecycle that calls it is in [[play-runtime]].
