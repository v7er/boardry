---
title: Package whitelist
layer: whitelist
kind: whitelist
summary: The stack in use, grouped by area, with the rule to ask before adding anything.
links:
  - type: affects
    target: "[[api]]"
  - type: affects
    target: "[[portal]]"
  - type: affects
    target: "[[bo]]"
  - type: affects
    target: "[[authoring]]"
  - type: affects
    target: "[[sdk]]"
updated: 2026-11-10
---
The stack in use, from the workspace manifests. Before adding a package, check this list and the relevant `package.json`; ask before adding anything new.

## Toolchain

TypeScript 5.9.2, Node 18 or newer (the README says 20 for the CLI), pnpm 9, Turborepo 2, tsup 8.

## Backend

- NestJS 11: `@nestjs/common`, `core`, `platform-express`, `config`, `swagger`, `jwt`, `passport`, `mapped-types`, `event-emitter`.
- Express 5.
- Prisma 6, `@prisma/client`, `prisma-json-types-generator`, `@brakebein/prisma-generator-nestjs-dto`.
- ZenStack 2.20.1: `zenstack`, `@zenstackhq/runtime`, `@zenstackhq/server`, `@zenstackhq/openapi`.
- Auth: `better-auth`, `@thallesp/nestjs-better-auth`, `bcrypt`, `jose`.
- Validation: `class-validator`, `class-transformer`, `zod`.
- API docs: `openapi-metadata`, `openapi-merge`, `@nestjs/swagger`.
- Game packing: `yauzl`, `multer`, `slugify`, `sanitize-html`.
- Sandbox: `quickjs-emscripten`.

## Storage and platform

- `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`, `@aws-sdk/client-mediaconvert`, `@aws-sdk/client-lambda`.
- `ioredis`, `@nestjs/event-emitter`, `@nestjs-modules/mailer`, `nodemailer`, `undici`.
- Observability: `pino`, `pino-http`, `pino-pretty`.
- Utilities: `dayjs`, `lodash`, `nanoid`, `uuid`, `urlcat`, `nest-commander`.

## Portal

- Next 15.5, React 19.1, Mantine 8, `@mantine/carousel`, `@mantine/form`, `@mantine/hooks`, `@mantine/modals`, `@mantine/notifications`.
- `@tanstack/react-query`, `openapi-fetch`, `openapi-react-query`, `zustand`, `immer`, `zod`.
- `@tabler/icons-react`, `embla-carousel-react`, `qrcode.react`, `@vercel/analytics`, `@vercel/speed-insights`.

## Back office

- Next 14, React 18.2, Mantine 7, `@mantine/dates`, `@mantine/form`, `@mantine/hooks`, `@mantine/modals`, `@mantine/notifications`.
- `@tanstack/react-query`, `openapi-fetch`, `openapi-react-query`, `nuqs`, `zod`, `js-cookie`, `slugify`, `react-hot-toast`.

## Authoring and integration

- `@fzgame/kit`: no runtime dependencies; `tsup` and `vitest` for build and test.
- `@fzgame/cli`: `commander`, `@fzgame/kit`.
- `@fzgame/sdk`: `openapi-fetch`; `openapi-typescript` for generation.

## Quality

- `eslint` 9, `typescript-eslint`, `prettier` 3, `vitest` 4, `jest` 29 for the BO, `@swc/core`, `tsx`, `esbuild`.

The OpenAPI generation chain is in [[openapi-pipeline]]. The gaps are in [[known-gaps]].
