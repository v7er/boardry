---
title: Studio
layer: components
component: studio
kind: component
summary: The Tauri 2 and React desktop app in apps/studio. It draws the graph, edits notes, and hosts the AI chat.
links:
  - type: refines
    target: "[[boardy]]"
  - type: contains
    target: "[[studio-views]]"
updated: 2026-11-10
---
`apps/studio` is the desktop app: Tauri 2, React 19, TypeScript, Vite, Mantine, and React Flow.

Studio opens either a project root or a `.boardy/` folder, reads the notes through Rust commands (`load_boardy`, `save_note`, `move_note`, `delete_note`, `read_layer_index`), and runs the same core as the CLI. Reading through Rust avoids the Tauri fs plugin scope problem with hidden folders.

It keeps a small project list in local storage and polls the active folder every 2.5 seconds, reloading when the note signature changes. It does not keep its own graph.

The views and the AI chat are in [[studio-views]].
