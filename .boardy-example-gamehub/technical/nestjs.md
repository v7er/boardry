---
title: NestJS bootstrap
layer: technical
kind: decision
summary: Raw body for the GitHub webhook, pino logging, static OpenAPI files, and a strict global validation pipe.
links:
  - type: affects
    target: "[[api]]"
  - type: relates_to
    target: "[[auth]]"
updated: 2026-11-10
---
`src/main.ts` creates the Nest app with `bodyParser: false` and `rawBody: true`.

The order matters:

1. CORS from `CORS_ORIGINS` or `BETTER_AUTH_TRUSTED_ORIGINS`, defaulting to the portal and BO origins, with credentials.
2. `express.raw({ type: 'application/json' })` mounted only on `/webhooks/github`, so the HMAC is computed over the exact bytes.
3. `express.json()` and `express.urlencoded()` for everything else.
4. `pino` and `pino-http` logging. The request serializer redacts `authorization`, `cookie`, and `x-app-secret`.
5. Static `public/` so the OpenAPI documents are served.
6. A global `ValidationPipe` with `transform`, `whitelist`, and `forbidNonWhitelisted`. An unknown body field is a 400, not a silent drop.
7. Swagger at `/swagger` and `/swagger/json`.
8. Listen on `API_PORT`, default 3020.

The Redis WebSocket adapter is present but commented out. Realtime currently relies on the runtime HTTP endpoints and webhooks. That is recorded in [[known-gaps]].
