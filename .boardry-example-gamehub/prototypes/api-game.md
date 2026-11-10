---
title: Game and play API
layer: prototypes
component: api
kind: interface
summary: The catalog, publishing, instance, runtime, session, and leaderboard endpoints, with two endpoint walkthroughs.
links:
  - type: refines
    target: "[[api]]"
  - type: relates_to
    target: "[[publishing]]"
  - type: relates_to
    target: "[[play-runtime]]"
  - type: relates_to
    target: "[[game-instance]]"
  - type: relates_to
    target: "[[leaderboard]]"
updated: 2026-11-10
---
The game domain is split across four audiences. The same noun can have a different route on each surface.

## Public catalog

Anonymous, no key.

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/portal/catalog/games` | activated, non-private games |
| GET | `/portal/catalog/games/{id}` | one catalog game |
| GET | `/pub/categories` | public category feed |
| GET | `/pub/categories/{id}/games` | games in a category |

## Studio catalog

Tenant session plus `x-space-id`.

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/portal/games` | space-private games |
| POST | `/portal/games` | create a game from a git repository |
| GET | `/portal/games/{id}` | game with git sources and deployments |
| PUT | `/portal/games/{id}` | update metadata or schema |
| DELETE | `/portal/games/{id}` | delete a studio game |
| GET | `/portal/games/{id}/versions` | deployment versions |
| POST | `/portal/games/{id}/rollback` | put an earlier READY deployment in production |
| PUT | `/portal/games/{id}/delist` | return to DRAFT and drop production |
| POST | `/portal/games/publishing` | publish a space-private zip |

## Official catalog

Operator session.

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/admin/games` | official and developer games |
| POST | `/admin/games` | create an official game from git |
| GET | `/admin/games/{id}` | game, git source, deployments |
| DELETE | `/admin/games/{id}` | delete an official game |
| GET | `/admin/games/{id}/versions` | version history |
| POST | `/admin/games/{id}/rollback` | roll back production |
| POST | `/games/publishing` | publish an official zip |
| GET | `/catalog/templates` | template list |
| GET | `/catalog/templates/{id}` | template detail |
| PUT | `/catalog/templates/{id}` | edit a template |
| PUT | `/catalog/templates/{id}/activation` | activate or deactivate |
| PUT | `/games/{id}` | update a game |
| PUT | `/games/{id}/archive` | archive |
| PUT | `/games/{id}/delist` | delist and drop production |
| DELETE | `/games/{id}/{force}` | soft or hard delete |

## Game instances

| Method | Path | Audience |
| --- | --- | --- |
| GET, POST | `/portal/apps/{appId}/game-instances` | portal |
| GET, PUT, DELETE | `/portal/game-instances/{id}` | portal |
| PUT | `/portal/game-instances/{id}/publish` | portal |
| POST | `/portal/game-instances/{id}/resolve` | portal |
| GET | `/pub/game-instances/{id}` | anonymous |
| GET | `/games/runtime/instances/{id}` | alias of the public detail |
| GET | `/sdk/game-instances` | app key |
| GET | `/sdk/game-instances/{id}` | app key |

Creating an instance requires the template game to be `ACTIVED`. The instance starts `DRAFT`, inherits `game.entryPointUrl` into `resolvedUrl`, and keeps the instance `overrides`. Publishing the instance sets `PUBLISHED`. Only `PUBLISHED` instances are visible to the SDK and the public detail.

The public detail deliberately omits `unlockToken` and the relation lists. It returns the game, the resolved URL, the overrides, and a derived `editorUrl`.

## Play runtime

Anonymous. The game calls these from the iframe.

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/games/runtime/sessions` | fetch or create a session from `gameInstanceId` + `playerToken` |
| GET | `/games/runtime/sessions/{token}` | read a session |
| POST | `/games/runtime/sessions/{token}/emit` | move the lifecycle or store a custom event |
| PUT | `/games/runtime/sessions/{token}/snapshot` | store the local state |
| POST | `/games/runtime/handler` | run a handler against a finish payload, studio only |

## Sessions and leaderboard

| Method | Path | Audience |
| --- | --- | --- |
| GET | `/portal/sessions`, `/portal/sessions/{id}` | portal read-only history |
| GET | `/admin/sessions`, `/admin/sessions/{id}` | operator |
| POST | `/sdk/sessions` | app key, host-created session |
| GET | `/sdk/sessions/active` | app key, newest live session |
| GET, PUT | `/sdk/sessions/{token}` | app key |
| POST | `/sdk/sessions/{token}/start`, `pause`, `resume`, `finish`, `abort`, `score` | app key |
| GET | `/portal/game-instances/{id}/leaderboard/players`, `sessions` | portal |
| GET | `/pub/game-instances/{id}/leaderboard/players`, `sessions` | anonymous |
| GET | `/pub/games/{id}/leaderboard/players`, `sessions` | anonymous, across published instances |

## Walkthrough: POST /games/runtime/sessions

This is the endpoint that makes play and resume the same request.

1. The controller is anonymous. The body is `{ gameInstanceId, playerToken }`.
2. `GameRuntimeService.getOrCreateSession` loads the instance with `status: PUBLISHED` and its game. A missing instance is 404.
3. It finds the player by `(appId from the instance, identity = playerToken)`. A missing player is 404; a banned player is 403.
4. It looks for the player's newest session on that instance with status in `CREATED`, `READY`, `PLAYING`, or `PAUSED`. If one exists, it returns it. That is resume.
5. Otherwise it creates a `CREATED` session with a 24-hour `expiresAt`, emits `PlaySessionCreated`, and returns it with the player and game instance included.
6. The kit adopts the returned session. `kit.snapshot.status` is the server status and `kit.snapshot.state` is the stored snapshot.

There is no token bookkeeping on the game side. The player identity plus the instance selects the session.

## Walkthrough: POST /games/publishing

1. Operator guard. Multipart `file` plus `PublishGameDto`. The upload cap is 50 MB and the filename must end in `.zip`. The zip reader also caps entries at 5000, total uncompressed size at 200 MB, and the manifest at 1 MB.
2. `GamePublisherService.publishGame` inspects the zip with `yauzl`, reads `fzgame.json`, and validates it with `parseFzGameManifest`.
3. The origin is resolved from the caller: operator is `OFFICAL`, a space caller is `SPACE_PRIVATE`, a developer without a space is `DEVELOPER`.
4. A duplicate `slug` + `version` is rejected unless `force` is set. A forced overwrite must belong to the same origin and space.
5. The zip entries stream to S3 under `{slug}/v{version}/...`. The cover image and screenshots are resolved into the same prefix.
6. The `Game` row is created or updated with `status: ACTIVED`, `entryPointUrl` at `{slug}/v{version}/game/...`, and `backendUrl` at `{slug}/v{version}/handler/`.
7. The returned `Game` has registry-relative URLs. `RegistryUrlInterceptor` rewrites them to public URLs on the way out.

The publish code sets `ACTIVED` directly. The older architecture diagram says `DRAFT`; the code in `publisher.srv.ts` is the source of truth here.
