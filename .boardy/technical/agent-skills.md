---
title: Agent skills
layer: technical
kind: decision
links:
  - type: affects
    target: "[[core]]"
---
Two installable skills ship in `skills/`:
- `boardy-ask` - teaches an agent to query the base with `boardy ask`.
- `boardy-note` - teaches an agent to write a note in the right format.

They install via `npx @boardy/skills` into `.claude/skills`, `.cursor/skills`, and `.agents/skills`.
