---
title: GameHub
layer: brief
kind: vision
summary: A gamification platform where tenants configure games, players play them, and the platform keeps score and state.
links:
  - type: relates_to
    target: "[[glossary]]"
updated: 2026-11-10
---
GameHub is a gamification platform. A customer gets a **space**, registers **apps**, configures **game instances**, and collects **players** and **play sessions**.

A game is a small web app with three parts:

- a player iframe that draws the game and calls the runtime kit;
- an editor iframe that edits the instance configuration;
- a handler that runs on the server when a round finishes.

Games are authored outside GameHub, packed as a zip, and uploaded to a registry. The platform runs them, keeps score and state, and notifies the customer's systems through webhooks.

Four deliverables make up the product:

| Deliverable | What it is |
| --- | --- |
| API server | NestJS REST API, the single source of truth |
| Tenant portal | customer-facing web app for spaces, apps, instances, players, and analytics |
| Back office | internal operator console for spaces, users, catalog, runners, and deployments |
| Authoring toolkit | `@fzgame/kit` for games, `fzgame` CLI for init/dev/build/publish/runner |

The product is not a game engine. It is the hosting, configuration, score, and integration layer around a game that someone else built.

The vocabulary is in [[glossary]].
