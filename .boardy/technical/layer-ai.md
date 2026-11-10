---
title: LayerAI
layer: technical
kind: decision
summary: The wrapper that maps skills, tools, and agents onto each part. Specified, but only a stub command exists.
links:
  - type: affects
    target: "[[agent-skills]]"
  - type: relates_to
    target: "[[ai-context]]"
  - type: relates_to
    target: "[[known-gaps]]"
updated: 2026-11-10
---
LayerAI is the outside wrapper of the waterfall, not a layer in it. For any note, module, or layer it records which skill, tool, or agent fits there, and why.

The intended edges are `fits` and `fitted_by`, so discovery works both ways: from a part to the AI capability, and from a capability to every part it fits.

What exists today:

- `boardy fit <path>` looks for notes with `layer: ai` or under `ai/` whose raw text contains the target.
- No `ai/` notes and no `fits` edges exist in the code or in this base.
- The Studio chat does not read a capability map. It reads the top search hits.

LayerAI is a design with a stub command, not a working mapping.
