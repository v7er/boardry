---
title: Game instance
layer: modules
component: api
kind: module
summary: An instance is one configured game inside an app, with a resolved URL and instance overrides.
links:
  - type: refines
    target: "[[api]]"
  - type: relates_to
    target: "[[game-catalog]]"
  - type: relates_to
    target: "[[play-runtime]]"
updated: 2026-11-10
---
`AppGameInstance` is one configured instantiation of a `Game` inside an `App`.

It carries:

- `name` and `status` of `DRAFT`, `PUBLISHED`, or `ARCHIVED`;
- `resolvedUrl` and `resolvedAt`, copied from `game.entryPointUrl`;
- `overrides`, the instance configuration merged over the schema defaults;
- `gameId`, immutable;
- `unlockToken`, which never leaves the server through the public detail.

Creating an instance requires the template game to be `ACTIVED`. The instance starts `DRAFT`. `PUT /portal/game-instances/{id}/publish` sets `PUBLISHED` and stamps `resolvedAt`. `POST /portal/game-instances/{id}/resolve` re-reads the game entry point when a deployment moved it.

Only `PUBLISHED` instances appear in `GET /sdk/game-instances` and `GET /pub/game-instances/{id}`. The public detail omits `unlockToken` and the relation lists, and derives an `editorUrl` by replacing `/game/` with `/editor/` in the entry URL.

The instance is the join between the catalog and the player. The catalog is in [[game-catalog]]; the round is in [[play-runtime]].
