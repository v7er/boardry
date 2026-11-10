---
title: AI chat context
layer: technical
kind: decision
summary: Studio chat sends the top five search hits, up to 700 characters each, plus a short system prompt.
links:
  - type: affects
    target: "[[studio]]"
  - type: relates_to
    target: "[[search-index]]"
  - type: relates_to
    target: "[[studio-views]]"
updated: 2026-11-10
---
Studio's AI chat is deliberately thin.

For each prompt, `buildContext` in `apps/studio/src/ChatBox.tsx`:

1. runs the same MiniSearch index as the palette;
2. takes the top five hits;
3. sends each note's title, layer, and first 700 characters of body;
4. adds a system prompt that says to answer from `.boardy` and admit when a note does not cover the question.

It sends no graph edges, no backlinks, no full note bodies, and no project code. The model cannot follow wikilinks because targets are not resolved for it, and it cannot see that a note is stale.

The provider is configured by base URL, key, and model. Calls go through Rust (`chat`, `list_models`, `detect_ai_env`) so there is no browser CORS limit. The assistant answers. It does not write notes.
