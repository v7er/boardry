---
title: Known gaps
layer: technical
kind: observation
summary: Places where the written spec, the code, and the docs disagree, as of the current tree.
links:
  - type: affects
    target: "[[core]]"
  - type: affects
    target: "[[cli]]"
  - type: affects
    target: "[[studio]]"
  - type: relates_to
    target: "[[package-drift]]"
updated: 2026-11-10
---
Observed in the current tree, not planned work:

- The docs say `boardy check` reports broken waterfall. It reports orphans, broken links, missing layers, and unknown layers only.
- `AI_GUIDE.md` says the core and CLI are not built. They are built and run.
- `docs/CLI.md` says `tsup` bundles the CLI. `packages/cli` builds with `tsc` and has no `tsup` dependency.
- `docs/CORE.md` lists `unified` and the `remark-*` packages. The parser uses regular expressions and `yaml`.
- `boardy fit` only finds notes with `layer: ai` or under `ai/`. This base has no `ai` layer, so `fit` returns nothing.
- `boardy index --watch` prints "re-indexed" but does not rewrite `.index/index.json` after the first run.
- Studio's graph draws only `refines` and `part_of`. `depends_on` and `affects` stay in the markdown and are invisible on the canvas.
- Studio's chat sends the top five search hits only. `boardy ask` ranks by text, not by graph connectivity.

These notes follow the code where the two disagree.
