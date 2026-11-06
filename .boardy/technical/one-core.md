---
title: One TypeScript core
layer: technical
kind: decision
links:
  - type: affects
    target: "[[core]]"
---
The CLI and Studio share one TypeScript core with no file I/O. Each injects its own file access: Node `fs` in the CLI, the Tauri fs plugin in Studio. This keeps the two from disagreeing about how a note is parsed.
