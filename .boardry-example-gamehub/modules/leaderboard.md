---
title: Leaderboard
layer: modules
component: api
kind: module
summary: Two boards over finished sessions, per instance or across published instances of a game.
links:
  - type: refines
    target: "[[api]]"
  - type: relates_to
    target: "[[play-runtime]]"
updated: 2026-11-10
---
The leaderboard ranks `FINISHED` play sessions with a non-null score. There are two boards:

- **players** - one row per player, their best finished score. Ties are broken by player id for stable pages.
- **sessions** - every finished session, ordered by score, then finish time, then id.

The routes exist at two scopes:

- per game instance, under `/pub/game-instances/{id}/leaderboard/...` and the portal equivalent;
- per catalog game, under `/pub/games/{id}/leaderboard/...`, across every `PUBLISHED` instance of that game.

A public board only exists for a published instance, and the catalog board only for an `ACTIVED` non-private game. Page size defaults to 20 and is capped at 100.

Scores are client-supplied until the handler overrides them. The board reflects what was stored at finish, not a separately validated anti-cheat score.

The board reads the sessions written by [[play-runtime]].
