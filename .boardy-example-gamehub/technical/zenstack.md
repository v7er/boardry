---
title: ZenStack data rules
layer: technical
kind: decision
summary: zmodel is the source for Prisma, generated DTOs, and row policies; handlers use the enhanced client.
links:
  - type: affects
    target: "[[api]]"
  - type: relates_to
    target: "[[auth]]"
  - type: relates_to
    target: "[[tenancy]]"
updated: 2026-11-10
---
The schema lives in `apps/server/zmodel/*.zmodel`, not in `prisma/schema.prisma`. The generated Prisma schema is a build artifact.

`zmodel/schema.zmodel` declares three generators:

- `prisma-client-js` for the client;
- `prisma-generator-nestjs-dto` for the request and response classes in `src/openapi/`;
- `prisma-json-types-generator` for the JSON columns.

The same file carries the `@@allow` policies. Every model has a policy block for `SystemCtx`, `OperatorCtx`, `UserCtx`, `SpaceUserCtx`, and `AppCtx` where relevant. The base mixins mark `spaceId` and `appId` as `@deny('update', true)`, so tenancy cannot move by update.

Handlers use `GetPrisma(authContext)`, which returns the enhanced client. A query written without an explicit `spaceId` is still scoped by the policy. That is a feature and a trap: if the context is wrong, the query is wrong.

Do not hand-edit `src/openapi/**` or `prisma/schema.prisma`. Edit `zmodel` and run `pnpm compile`, then restart the API.

The request contexts are in [[auth]]. The tenant boundary is in [[tenancy]].
