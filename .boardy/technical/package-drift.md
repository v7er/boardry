---
title: Package drift
layer: technical
kind: observation
summary: Studio uses two packages outside the AGENTS.md whitelist, and the docs describe a different editor.
links:
  - type: affects
    target: "[[studio]]"
  - type: relates_to
    target: "[[stack]]"
updated: 2026-11-10
---
`AGENTS.md` is the declared whitelist. The current `apps/studio/package.json` also depends on:

- `@tisoap/react-flow-smart-edge`, used in `GraphView.tsx` for the edge router.
- `@lexical/rich-text`, imported by `MarkdownEditor.tsx` for the heading node.

Neither is on the whitelist. This is a real exception to the rule, not a note that the whitelist changed. Resolve it by removing the package or by adding a justified entry to `AGENTS.md`. Do not silently widen the rule.

A second mismatch: `AGENTS.md` allows `@mdxeditor/editor`, and Studio uses it. `ARCHITECTURE.md` and `docs/STUDIO.md` describe CodeMirror and `@uiw/react-codemirror` instead, which are not installed.
