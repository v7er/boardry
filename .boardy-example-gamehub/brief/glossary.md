---
title: Glossary
layer: brief
kind: term
summary: The words GameHub uses for tenants, games, instances, sessions, and builds.
links:
  - type: relates_to
    target: "[[vision]]"
  - type: relates_to
    target: "[[game-catalog]]"
  - type: relates_to
    target: "[[play-runtime]]"
updated: 2026-11-10
---
| Term | Meaning |
| --- | --- |
| Space | The tenant boundary. One customer can own several spaces. |
| App | A product inside a space. It owns credentials, players, game instances, sessions, and webhooks. |
| Player | An `AppPlayer` row, unique on `(appId, identity)`. The `identity` string is the `playerToken` in the play URL. |
| Game | A published game pack, unique on `(slug, version)`. It can be official, developer, or space-private. |
| Game instance | One configured instantiation of a game inside an app. It carries the instance overrides and the resolved entry URL. |
| Play session | One round of one player on one instance. It carries status, score, result, and snapshot. |
| Deployment | One build from a git source. A preview becomes production when promoted. |
| CiRunner | A self-hosted build worker that claims queued deployments. |
