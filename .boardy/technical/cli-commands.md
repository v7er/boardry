---
title: CLI commands
layer: technical
component: cli
kind: interface
links:
  - type: refines
    target: "[[cli]]"
---
The command surface of `boardy`.

Query:
- `boardy ask "<question>"` - ranked notes and their links.
- `boardy search "<term>"` - full-text search.
- `boardy show <path>` - print a note.
- `boardy links <path>` and `boardy backlinks <path>` - edges in and out.

Layers:
- `boardy layers`, `boardy brief`, `boardy components`.
- `boardy fit <path>` - what LayerAI maps onto a note.

Write:
- `boardy add --layer <layer>`, `boardy note "<title>" --layer <layer>`.
- `boardy link <a> <b> --type <verb>`, `boardy unlink <a> <b>`.

Index and check:
- `boardy init`, `boardy index`, `boardy index --watch`, `boardy check`.

Tools:
- `boardy status`, `boardy serve`, `boardy --version`.
