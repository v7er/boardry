---
title: Generated contract
layer: technical
kind: decision
summary: The zmodel and controller annotations generate the specs, and the specs generate every client type.
links:
  - type: affects
    target: "[[api]]"
  - type: relates_to
    target: "[[openapi]]"
  - type: relates_to
    target: "[[sdk-client]]"
updated: 2026-11-10
---
Decision: the API contract is generated end to end.

```text
zmodel/*.zmodel
  -> prisma/schema.prisma + src/openapi/** DTOs
  -> controllers + openapi-metadata annotations
  -> apps/server/public/openapi-{admin,portal,sdk}.json
  -> portal/src/types/schema.d.ts
  -> bo/src/types/schema.d.ts
  -> packages/sdk/src/types/schema.d.ts
```

Why: a route rename or a DTO change must not be a runtime surprise. After regeneration it is a TypeScript error in the consumer.

Consequences:

- The generated JSON and `schema.d.ts` files are committed. They can lag the source between regeneration steps.
- `reference.json` is a byte-for-byte mirror of `openapi-sdk.json` because that is the URL `@fzgame/sdk` documents.
- A controller that is not listed in `scripts/ctrls.openspec.ts` is missing from the spec even if it is mounted.
- The SDK README notes that the checked-in schema predates the session routes, so the types are behind. See [[known-gaps]].

The command sequence is in [[openapi]]. The client is in [[sdk-client]].
