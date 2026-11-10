---
title: CLI
layer: components
component: cli
kind: component
summary: The Node command line in packages/cli. It reads and writes .boardy/ and never calls a model.
links:
  - type: refines
    target: "[[boardy]]"
  - type: contains
    target: "[[cli-commands]]"
updated: 2026-11-10
---
`packages/cli` is the `boardy` command. It runs the core over the `.boardy/` folder and covers query, layers, writing notes and links, indexing, checking, and a read-only viewer.

It is the surface the `boardy-ask` skill tells an agent to use first: `boardy ask` and `boardy search` need no key, no model, and no network. `boardy check` is the cheap guard before a change.

File discovery uses `fast-glob`. The folder is found by walking up from the current directory until a `.boardy/` with `index.md` appears. `--path` points at either a `.boardy/` folder or a project root that contains one.

The command surface is in [[cli-commands]].
