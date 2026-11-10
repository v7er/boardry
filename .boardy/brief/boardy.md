---
title: boardy
layer: brief
kind: vision
summary: A document centre for a product. Markdown notes in layers, one graph, read by people, the CLI, Studio, and AI agents.
updated: 2026-11-10
---
boardy is a document centre for a product. Everything the team knows about it lives in one `.boardy/` folder of markdown notes: the vision, the parts, their interfaces, the decisions, and the allowed libraries.

`index.md` declares the layers and their order. Notes link along the waterfall and across it, so one graph can answer what a thing is, where it lives, and what breaks if it changes.

Three surfaces read and write the same folder:

- the `boardy` CLI
- Studio, a Tauri desktop app
- agent skills that point an AI at the notes

The folder is committed with the code. The derived index in `.boardy/.index/` is not.

The product is not only a wiki. The point is to give a human and an AI the same short, structured answer before either changes the product.
