---
name: boardry-note
description: Write a note into a boardry `.boardry/` knowledge base in the correct markdown format. Use when a human asks to record a decision, component, convention, term, or any finished aspect of the project. Generates the note with frontmatter and writes it to the right layer folder.
---

# boardry-note

Record a finished aspect of the project as a `.boardry/` note.

## When to use

- The human says "save this as a note", "record this decision", or "document this".
- Only after the aspect is done. Never draft a note speculatively.

## Steps

1. Read `.boardry/index.md` to learn the layers and their order.
2. Pick the right `layer` for the note.
3. Write the note with YAML frontmatter:

```markdown
---
title: <short title>
layer: <layer name from index.md>
component: <component, if the note refines one>
kind: <decision | endpoint | screen | page | term | ...>
links:
  - type: <verb>
    target: "[[other-note]]"
---

Body in plain markdown.
```

4. Write it to `.boardry/<layer>/<slug>.md`.
5. Link it to the notes it touches with `[[wikilinks]]` or typed `links`.

## Rules

- Write when done, not before. An unfinished idea goes in a `type: brainstorming` note instead.
- A note holds facts. Leave out what you do not know.
- Never edit an existing note without being asked.
