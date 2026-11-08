---
title: New node dialog
layer: prototypes
component: studio
kind: interface
links:
  - type: refines
    target: "[[studio]]"
---
Studio creates a node from the **(+)** button on a graph node.

- The dialog has two fields: name and optional content.
- Everything else is inferred. The layer is the layer of the node the new node was created from.
- The new note links to its parent with `refines`.
- No layer picker, no kind, no component.
