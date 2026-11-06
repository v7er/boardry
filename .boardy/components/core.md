---
title: Core
layer: components
kind: component
links:
  - type: refines
    target: "[[boardy]]"
  - type: contains
    target: "[[parser]]"
  - type: contains
    target: "[[graph]]"
  - type: contains
    target: "[[search-index]]"
---
The shared engine in `packages/core`. Pure TypeScript with no file I/O: it takes text in and returns a graph and an index. The CLI and Studio both run it.
