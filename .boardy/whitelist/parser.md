---
title: Parser
layer: whitelist
component: core
kind: module
links:
  - type: refines
    target: "[[core]]"
---
Reads a note: splits the YAML frontmatter, parses it with `yaml`, and extracts wikilink targets from the body.
