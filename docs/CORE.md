# Core

The shared engine. All features, requirements, and tech for `packages/core`.

## What it is

Pure TypeScript with no file I/O. It takes text in and returns a graph and an index. The CLI and Studio run the same core unchanged.

## What it does

1. Reads `index.md` to learn the layers and their order.
2. Parses each note: frontmatter, `[[wikilinks]]`, and body.
3. Validates the frontmatter against the schemas.
4. Builds a graph (nodes are notes, edges are typed links) and a full-text index.
5. Skips notes marked `type: brainstorming`.

## The graph

- Nodes are notes; edges are typed links (`refines`, `depends_on`, `affects`, and the rest).
- Backlinks are computed from incoming links.
- The waterfall order comes from `index.md`.
- Orphans, broken links, and broken waterfall are detected here.

## The file access seam

The core does not touch the file system. It depends on one narrow interface, which each surface implements:

```text
read(path)        -> text
write(path, text) -> void
list(dir)         -> paths
watch(dir, cb)    -> unwatch
```

- The CLI implements it with Node `fs`, `fast-glob`, and `chokidar`.
- Studio implements it with `@tauri-apps/plugin-fs`.

## Tech

- `unified` with `remark-parse`, `remark-gfm`, `remark-wiki-link`, and `remark-frontmatter`.
- `yaml` for frontmatter.
- `zod` for validation.
- `graphology` for the graph.
- `minisearch` for the index.

Published as `@boardry/core`.
