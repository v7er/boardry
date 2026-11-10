---
title: Deployment
layer: modules
component: api
kind: module
summary: Git connectors feed sources, sources queue deployments, runners build previews, and a promote makes production.
links:
  - type: refines
    target: "[[api]]"
  - type: relates_to
    target: "[[game-catalog]]"
  - type: relates_to
    target: "[[publishing]]"
updated: 2026-11-10
---
The git delivery path is four records:

| Record | Role |
| --- | --- |
| `GitConnector` | a GitHub App installation or another provider credential |
| `GitSource` | one repository and branch bound to a game |
| `Deployment` | one immutable build from a commit |
| `CiRunner` | a self-hosted worker that claims queued deployments |

A push to the tracked branch hits `POST /webhooks/github`. The route reads the raw body, verifies the HMAC, and queues a `Deployment`. A runner authenticates with its runner key and password, claims the next job, clones, runs `fzgame build`, appends logs, advances the stage, and uploads artifacts.

A build lands as a `READY` preview. Promoting it writes the deployment's entry point, backend URL, and config schema onto the `Game` and makes it `ACTIVED`. A rollback promotes an earlier `READY` deployment.

Deployment statuses are `QUEUED`, `BUILDING`, `READY`, `ERROR`, and `CANCELED`. The unique key is `(gameId, version, commitSha)`.

The manual zip path is in [[publishing]]. The record it updates is in [[game-catalog]].
