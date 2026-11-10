---
title: Agent map
layer: ai
kind: map
summary: LayerAI's map from a GameHub part to the capability that fits it.
links:
  - type: fits
    target: "[[api]]"
  - type: fits
    target: "[[portal]]"
  - type: fits
    target: "[[bo]]"
  - type: fits
    target: "[[authoring]]"
  - type: fits
    target: "[[play-runtime]]"
  - type: relates_to
    target: "[[known-gaps]]"
updated: 2026-11-10
---
LayerAI maps a part of the product to the skill, tool, or agent that fits it. This is the wrapper around the waterfall, not a product layer.

| When the task is | Read first | Capability that fits |
| --- | --- | --- |
| Add or change an API endpoint | `api-surface`, `api-game`, `openapi-pipeline` | API contract review; then regenerate specs and clients |
| Change a model, policy, or migration | `zenstack`, `auth`, `tenancy` | schema and authorization review; run the server type check |
| Change a portal or BO screen | `portal-views` or `bo-views`, `brand` | UI review, then the generated client |
| Add or fix a game pack | `game-pack`, `kit`, `cli` | game-authoring workflow; rebuild kit before CLI |
| Debug a play session | `play-runtime`, `session-lifecycle`, `handler-vm` | runtime debugging; reproduce the transition |
| Investigate publish or storage | `publishing`, `storage` | release and artifact check |
| Review security | `security`, `auth`, `webhooks` | security audit; treat the player token as impersonatable |
| Write a note | the boardy-note skill | boardy-note |

Exact note ids for `boardy fit`: `components/api`, `components/portal`, `components/bo`, `components/authoring`, `modules/play-runtime`, `modules/handler-vm`, `modules/kit`, `technical/security`, `technical/known-gaps`.

The map is deliberately narrow. It points at the note to read and the kind of review to run; it does not replace the code.

Some capability names above are roles, not installed skills. The installed ones in this workspace are `boardy-ask`, `boardy-note`, `security-audit`, `codebase-memory`, and `impeccable`. The rest are placeholders until a skill exists.

The gaps that limit this map are in [[known-gaps]].
