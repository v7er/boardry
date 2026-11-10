---
title: Authoring toolkit
layer: components
component: authoring
kind: component
summary: The kit a game loads and the fzgame CLI that scaffolds, serves, builds, and publishes a pack.
links:
  - type: refines
    target: "[[vision]]"
  - type: contains
    target: "[[game-pack]]"
  - type: contains
    target: "[[kit]]"
  - type: contains
    target: "[[cli]]"
updated: 2026-11-10
---
A game author works with two packages:

- `@fzgame/kit` is the runtime the game imports. It has zero runtime dependencies, resolves the instance from the play URL, creates or resumes a session, emits lifecycle events, and exposes the snapshot and leaderboard.
- `@fzgame/cli`, bin `fzgame`, scaffolds a game, serves it locally with a mock runtime, builds the zip, publishes it, and starts a CI runner.

The pack itself is three iframes plus `fzgame.json`. The CLI vendors the kit into `game/vendor/kit.js` so a published game does not bundle it.

The pack format is in [[game-pack]]. The runtime API is in [[kit]]. The commands are in [[cli]].
