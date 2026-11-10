---
title: Agent skills
layer: technical
kind: decision
summary: Two installable skills, boardy-ask and boardy-note, teach an agent to query and write the base.
links:
  - type: affects
    target: "[[cli]]"
  - type: relates_to
    target: "[[note-format]]"
  - type: relates_to
    target: "[[scope]]"
updated: 2026-11-10
---
Two skills ship in `skills/`:

- `boardy-ask` - before answering or changing code, run `boardy ask`, then `search`, `fit`, and `check`. Read the top notes instead of guessing.
- `boardy-note` - write a finished aspect as a note with the right `layer`, `component`, `kind`, and links, into `.boardy/<layer>/<slug>.md`.

`skills/install.mjs` copies them into `.claude/skills`, `.cursor/skills`, and `.agents/skills`. This repo already has those three copies.

The skills are instructions, not a daemon. A teammate's agent can read the notes before installing anything, because the notes are committed files.
