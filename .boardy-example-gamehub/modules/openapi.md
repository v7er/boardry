---
title: OpenAPI pipeline
layer: modules
component: api
kind: module
summary: One generated document per audience, then generated TypeScript clients in each consumer.
links:
  - type: refines
    target: "[[api]]"
  - type: relates_to
    target: "[[api-surface]]"
  - type: relates_to
    target: "[[openapi-pipeline]]"
  - type: relates_to
    target: "[[sdk-client]]"
updated: 2026-11-10
---
The API contract is generated, not hand-written.

1. `zmodel/*.zmodel` compiles to the Prisma schema and to NestJS DTO classes under `src/openapi/`.
2. Controllers annotate routes with `openapi-metadata` decorators and are listed in `scripts/ctrls.openspec.ts`.
3. `pnpm gen:openapi-spec` writes five files to `apps/server/public/`:

| File | Contents |
| --- | --- |
| `openapi-admin.json` | `CTRLS_ADMIN` plus better-auth under `/auth` |
| `openapi-portal.json` | `CTRLS_PORTAL` plus better-auth under `/auth` |
| `openapi-sdk.json` | `CTRLS_SDK` |
| `openapi.json` | deduped union of the three |
| `reference.json` | byte-for-byte mirror of `openapi-sdk.json` |

4. The portal and BO run `gen:openapi` against their own document. `@fzgame/sdk` runs `compile` against `openapi-sdk.json`.

A route rename in a controller therefore becomes a TypeScript error in the apps and the SDK after regeneration. The pipeline is only as current as the last run; the generated files in git are not proof that the source matches.

The contract is in [[api-surface]]. The pipeline decision is in [[openapi-pipeline]]. The client is in [[sdk-client]].
