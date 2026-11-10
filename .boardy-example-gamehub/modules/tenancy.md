---
title: Tenancy
layer: modules
component: api
kind: module
summary: Space is the tenant boundary; App is the product boundary; both ids are immutable.
links:
  - type: refines
    target: "[[api]]"
  - type: relates_to
    target: "[[auth]]"
updated: 2026-11-10
---
A `Space` is the tenant boundary. A `UserSpace` row is a membership, with `OWNER` or `MEMBER` plus a `SpaceRole` of `ADMIN`, `DEVELOPER`, or `EDITOR`.

An `App` belongs to a space and owns the app's credentials, players, game instances, play sessions, and webhooks. The base mixins enforce the boundary:

- `BaseSpace` adds `spaceId` and marks it `@deny('update', true)`.
- `BaseApp` adds `spaceId` and `appId`, both denied on update.

A row therefore cannot move between tenants or apps by an update. A move would be a delete and a recreate.

The portal routes require `x-space-id` and a membership. The SDK routes derive the app and space from the credential, so the caller cannot pass a different `spaceId`. Operator routes are not space-scoped.

The data rules are in [[zenstack]]. The request contexts are in [[auth]].
