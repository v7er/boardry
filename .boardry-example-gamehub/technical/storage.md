---
title: Object storage
layer: technical
kind: decision
summary: MinIO in local and S3 in production, with registry-relative URLs rewritten on the way out.
links:
  - type: affects
    target: "[[publishing]]"
  - type: relates_to
    target: "[[handler-vm]]"
  - type: relates_to
    target: "[[game-catalog]]"
updated: 2026-11-10
---
Local uses MinIO; production uses S3 behind a CDN. The bucket is `games` by default (`S3_BUCKET`).

Keys:

- `{slug}/v{version}/game/...` for a published pack;
- `{slug}/v{version}/editor/...`;
- `{slug}/v{version}/handler/...`;
- `{slug}/preview/{sha}/...` for a git preview;
- screenshot and cover files under the same prefix.

The database stores registry-relative URLs. `RegistryUrlInterceptor` rewrites the known URL fields to public URLs on response, and back to relative on request. The base is resolved in this order: `REGISTRY_URL`, `S3_CDN_DOMAIN`, then the S3 endpoint plus bucket.

The handler VM loads `handler/index.js` from this bucket by deriving the key from `backendUrl`. It refuses a key that escapes the prefix or is an absolute URL.

The asset module also uses S3, with presigned uploads and a MediaConvert trigger. The upload cap for a game zip is 50 MB; the Webhook and handler limits are separate.

The publish path is in [[publishing]]. The handler is in [[handler-vm]].
