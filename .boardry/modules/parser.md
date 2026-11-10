---
title: Parser
layer: modules
component: core
kind: module
summary: Splits frontmatter, parses YAML, extracts wikilinks, and can patch frontmatter in place.
links:
  - type: refines
    target: "[[core]]"
  - type: relates_to
    target: "[[note-format]]"
updated: 2026-11-10
---
`packages/core/src/parse.ts` turns one markdown note into frontmatter, body, and wikilink targets.

- Frontmatter is the first `---` block. It is parsed with `yaml`.
- Wikilinks are written with two square brackets around a target, with an optional pipe label.
- `updateFrontmatter` merges a patch into the existing frontmatter and leaves the body alone.
- `parseNote` is the small function `buildKnowledge` calls.

No remark or unified parser is used in the current code, although the docs and the whitelist list it. The parser is regular expressions plus `yaml`. This is one place where the written spec and the code differ.
