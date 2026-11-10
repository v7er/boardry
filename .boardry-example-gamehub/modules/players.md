---
title: Players
layer: modules
component: api
kind: module
summary: AppPlayer is unique on appId plus identity; the identity string is the player token.
links:
  - type: refines
    target: "[[api]]"
  - type: relates_to
    target: "[[play-runtime]]"
  - type: relates_to
    target: "[[sdk-client]]"
updated: 2026-11-10
---
`AppPlayer` is a player of one app, unique on `(appId, identity)`. It carries `type` of `ANONYMOUS` or `IDENTIFIED`, optional `externalId`, `displayName`, `avatarUrl`, `metadata`, and `bannedAt`.

The SDK upserts a player with `POST /sdk/login`. The `identity` is the customer's own user id; the same value becomes the `playerToken` in the play URL. A player created without an identity cannot connect to the runtime, because `getOrCreateSession` looks up by `(appId, identity)`.

The portal can list, create, update, export, ban, unban, and delete players per app. A ban blocks `/sdk/login` and the runtime connect, and expires the player's live sessions.

`POST /sdk/players/{id}/logout` expires every live session of a player. It is the clean way to end a session when the host logs the player out.

The player is the subject of a [[play-runtime]] session. The host that creates it is in [[sdk-client]].
