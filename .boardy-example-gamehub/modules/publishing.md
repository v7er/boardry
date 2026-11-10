---
title: Publishing
layer: modules
component: api
kind: module
summary: Zip upload, manifest validation, S3 layout, duplicate rules, and registry-relative URLs.
links:
  - type: refines
    target: "[[api]]"
  - type: relates_to
    target: "[[storage]]"
  - type: relates_to
    target: "[[game-catalog]]"
updated: 2026-11-10
---
Publishing is the manual zip path. It starts at one of two endpoints:

- `POST /games/publishing` for an operator, origin `OFFICAL`;
- `POST /portal/games/publishing` for a space user with `ADMIN` or `DEVELOPER`, origin `SPACE_PRIVATE`.

The upload is multipart, field `file`, 50 MB cap, `.zip` only. The zip reader also enforces 5000 entries, 200 MB of total uncompressed bytes, and a 1 MB `fzgame.json`; it rejects a path with `..` or a leading slash. `GamePublisherService` then:

1. inspects the zip with `yauzl` and reads `fzgame.json`;
2. validates it with `parseFzGameManifest` (name, kebab-case slug, positive version, entry paths, schemas);
3. resolves the origin from the caller and checks that a `spaceId` is present only for a space game;
4. rejects a duplicate `slug` + `version` unless `force` is set, and refuses a forced overwrite across origins or spaces;
5. streams every entry to S3 under `{slug}/v{version}/...`;
6. resolves the cover image and screenshots into that prefix;
7. creates or updates the `Game` with `status: ACTIVED`, `entryPointUrl` and `backendUrl`.

The handler is stored at `{slug}/v{version}/handler/...`. The game entry is at `{slug}/v{version}/game/...`. A preview deployment uses `{slug}/preview/{sha}/...` instead.

Stored URLs are registry-relative. `RegistryUrlInterceptor` rewrites fields such as `entryPointUrl`, `backendUrl`, `resolvedUrl`, `coverImageUrl`, and `assetBaseUrl` to public URLs on the way out. The registry base is `REGISTRY_URL`, then `S3_CDN_DOMAIN`, then the S3 endpoint plus bucket.

The storage layer is in [[storage]]. The catalog record is in [[game-catalog]].
