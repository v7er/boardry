---
title: CLI
layer: prototypes
component: authoring
kind: module
summary: fzgame init, dev, build, publish, login, and runner.
links:
  - type: refines
    target: "[[authoring]]"
  - type: relates_to
    target: "[[game-pack]]"
  - type: relates_to
    target: "[[kit]]"
  - type: relates_to
    target: "[[publishing]]"
updated: 2026-11-10
---
`@fzgame/cli` is the `fzgame` binary. It depends on `@fzgame/kit` and `commander`.

| Command | What it does |
| --- | --- |
| `fzgame login` | sign in as an operator and store the session in `~/.fzgame/auth.json` |
| `fzgame init [dir]` | copy the `fzgame-sample` template and stamp `info.name` / `info.slug` |
| `fzgame dev` | serve the pack, the kit, and a mock runtime on port 3400 |
| `fzgame build` | validate the manifest, vendor the kit, write `dist/<slug>-v<version>.zip` |
| `fzgame publish` | build then upload the zip to the API |
| `fzgame runner start` | start a self-hosted CI worker |

`fzgame dev` needs no GameHub. It serves static files, `/@fzgame/kit.js`, mock `/games/runtime` and `/pub/game-instances`, and `/health` for the portal sandbox. CORS is open and the default bind is `127.0.0.1`; `--host 0.0.0.0` exposes an unauthenticated mock runtime on the LAN.

`publish` omits `--space` for an official game and requires an operator session. `--space <id>` publishes a space-private game instead. A duplicate `slug` + `version` fails unless `--force` is set.

Environment variables: `FZGAME_API`, `FZGAME_TOKEN`, `FZGAME_SPACE_ID`, `FZGAME_RUNNER_KEY`, `FZGAME_RUNNER_PASS`, `FZGAME_EMAIL`, `FZGAME_PASSWORD`. A `.env` in the working directory is read; shell values win.

The pack is in [[game-pack]]. The runtime it serves is in [[kit]]. The upload path is in [[publishing]].
