---
title: Scoping a task
layer: technical
kind: convention
summary: How an agent uses the base to bound a prompt, from brief to component to check.
links:
  - type: relates_to
    target: "[[boardy]]"
  - type: relates_to
    target: "[[agent-skills]]"
  - type: relates_to
    target: "[[known-gaps]]"
updated: 2026-11-10
---
The base is a way to bound a task before writing code, not a chat history.

A working order:

1. `boardy brief` - the vision and the non-goals.
2. `boardy ask "<task words>"` - the notes closest to the task.
3. `boardy links <note>` - what this note refines, contains, or affects.
4. `boardy layers` - which layer the change belongs to. A command change is a prototype. A parsing change is a module. A new library is a whitelist question.
5. `boardy check` - the edit did not orphan a note or break a link.
6. Read the code the note names, then edit.

What this buys:

- Scope: the brief and component notes say what is out.
- Vocabulary: the note titles and link verbs give the agent the product's words, not generic ones.
- Blast radius: `contains`, `depends_on`, and `affects` name the neighbours before the edit.
- A place to write back: a finished decision goes into the right layer, so the next agent starts warmer.

What it does not buy: the notes are only as good as their maintenance, and the chat does not read them the way the CLI does. See [[known-gaps]].
