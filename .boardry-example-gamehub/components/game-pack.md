---
title: Game pack
layer: components
component: authoring
kind: interface
summary: A game is three iframes plus fzgame.json, built into a zip and published to the registry.
links:
  - type: refines
    target: "[[authoring]]"
  - type: relates_to
    target: "[[kit]]"
  - type: relates_to
    target: "[[cli]]"
  - type: relates_to
    target: "[[publishing]]"
updated: 2026-11-10
---
A game root is a folder with `fzgame.json` and three directories:

| Folder | Loaded as | Job |
| --- | --- | --- |
| `game/` | player iframe | draw the game, call the kit |
| `editor/` | studio iframe | edit the instance config |
| `handler/` | server VM on finish | turn the finish payload into stored score and result |

The manifest declares catalog identity, entry points, four JSON Schemas, and the view mode:

```json
{
  "info": { "name": "FZ Game Sample", "slug": "fzgame-sample", "version": 1 },
  "entry": {
    "game": "game/index.html",
    "editor": "editor/index.html",
    "handler": "handler/index.js"
  },
  "viewMode": "portrait",
  "formSchema": { "type": "object", "properties": {} },
  "resultSchema": { "type": "object", "properties": {} },
  "snapshotSchema": { "type": "object", "properties": {} },
  "gameDataSchema": { "type": "object", "properties": {} }
}
```

| Field | Meaning |
| --- | --- |
| `info` | name, slug, version, optional image, description, author, git_url |
| `entry` | optional paths; defaults are the three above |
| `formSchema` | instance configuration; `kit.config()` merges defaults then overrides |
| `formUiSchema` | optional widget hints |
| `resultSchema` | shape of `finish` and handler output |
| `snapshotSchema` | shape of mid-play state |
| `gameDataSchema` | persistent instance/content data |
| `screenshots` | pack-relative paths or http(s) URLs |
| `viewMode` | `portrait` or `landscape` |

`fzgame build` vendors `@fzgame/kit` into `game/vendor/kit.js` and writes `dist/<slug>-v<version>.zip`. `fzgame publish` uploads that zip. The legacy flat `name`/`slug`/`version`/`configSchema` form still parses, with `configSchema` as an alias for `formSchema`.

The pack is not a React app. Each of the three folders is a plain web entry; the kit is the only required shared code.
