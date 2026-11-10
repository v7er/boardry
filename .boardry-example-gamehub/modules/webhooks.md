---
title: Webhooks
layer: modules
component: api
kind: module
summary: App and space hooks receive play-session events with an HMAC signature and retries.
links:
  - type: refines
    target: "[[api]]"
  - type: relates_to
    target: "[[play-runtime]]"
  - type: relates_to
    target: "[[security]]"
updated: 2026-11-10
---
A `Webhook` belongs to a space and optionally an app. It subscribes to one or more `WebhookEvent` values:

`SESSION_CREATED`, `SESSION_STARTED`, `SESSION_FINISHED`, `SESSION_ABORTED`, `SCORE_UPDATED`, and `CUSTOM`.

The play-session use cases emit NestJS events. `WebhookListener` maps them to a fan-out: app hooks plus space-wide hooks where `appId` is null.

Delivery is persisted. Each attempt is a `WebhookDelivery` row with status, attempts, status code, duration, a response snippet, and `nextAttemptAt`. The defaults are:

- 10 second timeout per attempt;
- 5 attempts total;
- 5 second base backoff, doubling, capped at 15 minutes;
- a sweep every 30 seconds, 25 deliveries per sweep.

A hook with a secret is signed. The headers are `x-webhook-timestamp` (unix seconds) and `x-webhook-signature` (a `sha256=<hex>` HMAC over the timestamp, a dot, and the exact body bytes). The consumer should reject an old timestamp to stop replay.

The portal and BO can test a hook and redeliver a stored delivery. The test payload carries `test: true` and the hook id.

The event source is [[play-runtime]]. The signature scheme is part of [[security]].
