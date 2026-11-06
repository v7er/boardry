---
name: boardy-ask
description: Query a boardy knowledge base with the `boardy` CLI. Use when answering a question about a product from its `.boardy/` notes, tracing a decision, or checking what a change could break. Run `boardy ask`, `boardy search`, `boardy fit`, and `boardy check` instead of guessing.
---

# boardy-ask

Query the project's `.boardy/` knowledge base before answering or changing anything.

## When to use

- A question starts with "why", "how does", or "where is" about the product.
- Before changing code that a decision or convention might cover.
- Before picking a library, to check the whitelist layer.

## Steps

1. Confirm the CLI: `boardy --version`. If it is not on your path, use `node packages/cli/dist/index.js --version`.
2. `boardy ask "<question>"` - ranked notes and their links. Read the top results.
3. `boardy search "<term>"` - plain full-text search when `ask` is too narrow.
4. `boardy fit <note-or-layer>` - which skill, tool, or agent the team mapped to it.
5. `boardy check` - orphans, broken links, and broken waterfall before a change.

## Rules

- Read the notes first. Never answer from memory when `.boardy/` has the answer.
- Brainstorming notes (`type: brainstorming`) are ignored. Do not read them.
- Stay on the whitelist when choosing packages.
