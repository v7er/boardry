---
title: CLI
layer: components
kind: component
links:
  - type: refines
    target: "[[boardy]]"
  - type: contains
    target: "[[cli-commands]]"
---
The `boardy` command line in `packages/cli`. A single Node CLI that reads and writes `.boardy/` and shares the core with Studio. It is deterministic: query and check never call a model.
