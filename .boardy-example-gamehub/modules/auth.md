---
title: Auth
layer: modules
component: api
kind: module
summary: Better-auth sessions, app-key credentials, five request contexts, and ZenStack row policies.
links:
  - type: refines
    target: "[[api]]"
  - type: relates_to
    target: "[[tenancy]]"
  - type: relates_to
    target: "[[security]]"
updated: 2026-11-10
---
Every request is resolved into an `AuthContext`. The context is both the NestJS request identity and the input to the ZenStack row policies.

| Context | Who | Set fields |
| --- | --- | --- |
| `SystemCtx` | internal runtime | `principal = SYSTEM` |
| `OperatorCtx` | operator acting globally | `principal = USER`, `id`, `kind = OPERATOR` |
| `UserCtx` | logged-in portal user outside a space | `principal = USER`, `id`, `kind = TENANT` or `PUBLISHER` |
| `SpaceUserCtx` | logged-in portal user inside a space | adds `spaceId`, `spaceMembership`, `role` |
| `AppCtx` | server-to-server SDK caller | `principal = APP`, `appId`, `spaceId`, `role` |

Three mechanisms feed those contexts:

- **Session cookie.** better-auth with `@thallesp/nestjs-better-auth`. `OperatorGuard`, `UserGuard`, and `SpaceUserGuard` read it.
- **Space header.** `x-space-id`, with aliases `space-id` and `:spaceId`, selects the space and triggers a membership lookup.
- **App credential.** `x-app-key` and `x-app-secret` resolve to an `AppCredential` and produce an `AppCtx`. The secret is hashed at rest and returned in plaintext only on create or rotate.

Controllers read the context with `@AuthContext()`. Data access uses `GetPrisma(ctx)`, which returns the enhanced Prisma client bound to the ZenStack policy input. That is why a handler rarely filters by `spaceId` explicitly: the policy does it.

The space roles are `ADMIN` (everything), `DEVELOPER` (apps, games, editors), and `EDITOR` (game instances). `OWNER` and `MEMBER` are membership, not permission.

The credential and tenancy model is in [[tenancy]]. The remaining risks are in [[security]].
