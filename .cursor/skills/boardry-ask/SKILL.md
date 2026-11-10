---
name: boardry-ask
description: Query a boardry knowledge base with the `boardry` CLI. Use when answering a question about a product from its `.boardry/` notes, tracing a decision, or checking what a change could break. Run `boardry ask`, `boardry search`, `boardry fit`, and `boardry check` instead of guessing.
---

# boardry-ask

Query the project's `.boardry/` knowledge base before answering or changing anything.

## When to use

- A question starts with "why", "how does", or "where is" about the product.
- Before changing code that a decision or convention might cover.
- Before picking a library, to check the whitelist layer.

## Steps

1. Confirm the CLI: `boardry --version`. If it is not on your path, use `node packages/cli/dist/index.js --version`.
2. `boardry ask "<question>"` - ranked notes and their links. Read the top results.
3. `boardry search "<term>"` - plain full-text search when `ask` is too narrow.
4. `boardry fit <note-or-layer>` - which skill, tool, or agent the team mapped to it.
5. `boardry check` - orphans, broken links, and broken waterfall before a change.

## Rules

- Read the notes first. Never answer from memory when `.boardry/` has the answer.
- Brainstorming notes (`type: brainstorming`) are ignored. Do not read them.
- Stay on the whitelist when choosing packages.
