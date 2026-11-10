# GameHub board sample

This is a complete boardy example built from the GameHub repository at
`/Users/tuevo/Projects/fanzeal/gamehub/gamehub`. It is a sample, not the product's official docs.

## What is here

- `index.md` declares seven layers: brief, components, prototypes, modules, technical, whitelist, and ai.
- 39 notes describe the product from the vision to the package stack.
- `brainstorming/daily-quests.md` is a `type: brainstorming` note. It is deliberately outside the graph and ignored by the CLI and by AI.
- `.gitignore` keeps the derived `.index/` cache out of version control.

## Read it

```bash
cd /Users/tuevo/v7e/planer
node packages/cli/dist/index.js status --path .boardy-example-gamehub
node packages/cli/dist/index.js layers --path .boardy-example-gamehub
node packages/cli/dist/index.js ask "how does resume work" --path .boardy-example-gamehub
node packages/cli/dist/index.js fit play-runtime --path .boardy-example-gamehub
node packages/cli/dist/index.js check --path .boardy-example-gamehub
```

## Where the API story starts

- `prototypes/api-surface.md`: the four controller audiences, the generated documents, and the 240-operation route families.
- `prototypes/api-game.md`: catalog, publishing, instance, runtime, session, and leaderboard endpoints, with two endpoint walkthroughs.
- `prototypes/api-sdk.md`: the 30 app-key operations and the host integration flow.
- `modules/play-runtime.md` and `modules/handler-vm.md`: what happens after `connect()`.
- `modules/publishing.md` and `modules/deployment.md`: the zip and git delivery paths.

## Source checked

The notes follow the current tree, including the generated OpenAPI documents under
`apps/server/public/` and the source under `apps/server/src/`. Where the prose docs disagree with the
code, `technical/known-gaps.md` records the difference. The most important one is that a zip publish
sets `ACTIVED` directly, not `DRAFT`.
