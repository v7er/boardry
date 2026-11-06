# boardy

**The document centre for your product.** Layers you define in `index.md`, linked into one graph, with AI skills mapped onto every part.

> [!NOTE]
> This repository holds a specification, not a shipped tool. The CLI, skills, and Studio app below are the target design. Nothing here is installed yet.

## Detailed specs

- [CLI](./docs/CLI.md) - the `boardy` command line: commands, behavior, and tech.
- [Studio](./docs/STUDIO.md) - the desktop app: features and tech.
- [Core](./docs/CORE.md) - the shared graph and index engine.

## What this changes

| Without a document centre | With a document centre |
|---|---|
| Knowledge lives in chat, tickets, and one person's head | Every decision, feature, and term is one markdown file in `.boardy/` |
| A new person or agent re-learns the product from scratch | They start from the notes the team already wrote |
| No single place answers "why is it built this way?" | `boardy ask` returns the note that decided it, with who and why |
| Docs drift because they live apart from the code | Notes sit next to the code and travel with it |
| Changing one part without knowing what it touches | The graph shows what depends on it before you edit |

## Contents

- [Detailed specs](#detailed-specs)
- [How it works](#how-it-works)
- [The layers](#the-layers)
- [LayerAI](#layerai)
- [When to write](#when-to-write)
- [Brainstorming notes](#brainstorming-notes)
- [The files: a note is a file](#the-files-a-note-is-a-file)
- [The graph](#the-graph)
- [Quick start](#quick-start-planned)
- [CLI](#cli-planned)
- [Skills for AI agents](#skills-for-ai-agents)
- [Studio](#studio-tauri-desktop-app)
- [Tech stack](#tech-stack)
- [What runs where](#what-runs-where)
- [What stays on your machine](#what-stays-on-your-machine)
- [Planned layout](#planned-layout)
- [Status](#status)

---

## How it works

The knowledge base is a waterfall of layers, from the broadest at the top to the most concrete at the bottom. A wrapper, LayerAI, sits around the whole thing and maps AI skills, tools, and agents onto every part. Everything is linked into one graph.

**The notes.** A folder at the project root, `.boardy/`, holds one markdown file per piece of knowledge. Each note states which layer it belongs to.

**The layers.** An `index.md` at the root of `.boardy/` declares the layers and their order. There is no fixed set: each project names its own layers. The tool reads `index.md` to draw the waterfall.

**LayerAI.** Around the waterfall, not part of it. For any note, module, or layer, LayerAI records which skill, tool, or agent fits there. It answers "what AI capability should I reach for here?"

**The graph.** Every note links to its neighbours, vertically along the waterfall and horizontally across it. The graph is derived from the markdown, never edited by hand.

**The surfaces.** A CLI, agent skills, and a Tauri Studio app are three ways to read and write the same folder.

The notes say *what* the product is and *why*. The layers say *how abstract or concrete* each note is. The graph says *how the pieces relate*. LayerAI says *which AI skill fits where*.

## The layers

The layers are not fixed. Each `.boardy/` folder has an `index.md` at its root that declares which folders are layers, in order from top to bottom.

```markdown
---
title: Layers
layers:
  - brief
  - components
  - prototypes
  - modules
  - technical
  - whitelist
---
```

Each entry in `layers` names a folder inside `.boardy/`, and the order is the waterfall order. A note's `layer` field holds one of these names. The tool reads `index.md` to draw the stack, so changing the list changes the stack. Nothing is hardcoded.

The six layers above are one common shape, not a requirement:

| Layer | Holds | Example |
|---|---|---|
| brief | the vision, in a few strong lines | "One checkout for every marketplace in the region." |
| components | the top-level parts and their submodules | mobile app, web dashboard, billing API, admin |
| prototypes | the concrete shape of each part | see the table below |
| modules | a finer unit inside a part, when needed | the refunds module inside billing-api |
| technical | how it is built, the technical choices | "Refunds go through the ledger, not the gateway." |
| whitelist | the libraries and tools you may use | "Fastify, zod, pnpm. Never write a client from scratch." |

A `whitelist` layer, when present, is a hard rule: pick from the list, do not write from scratch what it already covers.

### The prototypes layer, by component kind

One layer can mean different things for different kinds of component. In the shape above, the `prototypes` layer varies; the note's `kind` field says which.

| Component kind | The prototypes layer holds |
|---|---|
| API server | every endpoint and how to interact with it |
| Design | the style description, or uploaded images |
| Mobile | the scope: how many screens |
| Web app / desktop | the scope: how many pages |

So a billing API gets an endpoint list, a mobile app gets a screen count, and a brand design gets a style note or images. Each is a prototype of that component, sized to what the component is.

## LayerAI

LayerAI is the wrapper around all the layers. It does not sit in the waterfall; it points at it from the outside. For each part of the product, LayerAI records what AI can do there, and which capability fits.

| LayerAI holds | Example |
|---|---|
| skills | the `review-api` skill fits the billing API endpoints |
| tools | the `graph-db` MCP server fits the technical layer |
| agents | a `note-checker` agent flags notes that sit in the wrong layer |
| prompts and recipes | how to summarize a layer, or trace a decision to the code it touches |

For any note, module, or layer, LayerAI answers one question: which skill, tool, or agent fits here? That is how discovery works. You start from a part of the product, follow its LayerAI link, and land on the AI capability to use. You can also go the other way, from a skill to every part it fits.

## When to write

The knowledge base is not a brainstorm. A note goes in when an aspect of the project is done, not while it is being decided. You write the note yourself, straight into the layer it belongs to.

- A decision is written when it is made.
- A component is written when it is built.
- A screen, page, or endpoint is written when its shape is settled.
- A term is written when it starts being used.

An empty layer is not a gap to fill ahead of time. It means that part of the project has not happened yet. The knowledge base records what is done. LayerAI, on top, maps AI skills onto the parts that exist, for discovery.

## Brainstorming notes

A note can be marked `type: brainstorming`. These are free text for a human to think out loud. They stay out of the main graph: no layer, no typed edges, no index entry. AI ignores them, so they never leak into an answer or a draft.

```markdown
---
title: Refund ideas
type: brainstorming
---

Maybe refunds go through the gateway first, then sync to the ledger.
```

Write as much as you like here. When an idea becomes a real decision, write it again as a normal note in the right layer, and drop the brainstorm.

## The files: a note is a file

A note is a short markdown file with YAML frontmatter. The frontmatter carries the layer and links the index needs; the body is plain markdown for people to read.

```markdown
---
title: Refunds go through the ledger, not the gateway
layer: technical        # a name from index.md, or ai
component: billing-api  # the component this refines
kind: decision
links:
  - type: implements
    target: "[[refund-endpoint]]"
  - type: uses
    target: "[[ledger-module]]"
updated: 2026-10-09
---

## Decided
Refunds always write to the ledger first, then to the payment gateway.

## Ruled out
Refunding at the gateway and syncing later: a gateway outage leaves the ledger wrong.

## Watch out
The ledger is the source of truth. If it and the gateway disagree, trust the ledger.
```

`layer` places the note in the waterfall. `component` ties a lower-layer note to the component it refines. `links` and `[[wikilinks]]` in the body are two ways to say the same thing; the index reads both and computes backlinks. A note may also carry a `type`: the default is a normal note, while `type: brainstorming` marks free text the index skips and AI ignores.

Where everything lives:

```text
your-project/
└── .boardy/                the notes (commit them)
    ├── .gitignore              ignores .index/
    ├── index.md                declares the layers and their order
    ├── brief.md                layer: brief
    ├── components/             layer: components
    ├── prototypes/             layer: prototypes
    ├── modules/                layer: modules
    ├── technical/              layer: technical
    ├── whitelist.md            layer: whitelist
    ├── ai/                     LayerAI
    └── .index/                 the derived index, a local cache (gitignored)
```

`.boardy/` is the source of truth and is committed with the code. Its `index.md` declares the layers and their order. The derived index lives in `.boardy/.index/`, is rebuilt from the notes, and stays out of git through `.boardy/.gitignore`. A note's `layer` field, not its directory, is what places it.

## The graph

Every component has a place in the graph, and every note links to the notes around it. There are two axes.

**The waterfall, vertical.** A note in one layer refines a note in the layer above it. The chain runs in the order `index.md` declares it, for example `brief → component → prototype → module → technical → whitelist`. The edge is `refines` going down, `refined_by` going up. A component note lists its submodules with `contains` / `part_of`.

**The links, horizontal.** Typed edges between any two notes, across the waterfall. Each verb answers a question someone working on the product actually asks:

| Verb | The question it answers |
|---|---|
| `part_of` / `contains` | where does this live? |
| `refines` / `refined_by` | which layer does this detail? |
| `depends_on` | what breaks if I change this? |
| `implements` / `implemented_by` | what does this note realize in the code? |
| `decided_by` | who made this call? |
| `affects` | what does this decision touch? |
| `deprecates` | what does this replace? |
| `blocks` | what is waiting on what? |
| `relates_to` | what is worth reading next? (drawn faint) |

**LayerAI, the wrapper.** AI notes link to any part with `fits` / `fitted_by`. A skill points at the modules it fits; a module points back at the skills that fit it. These edges are what make discovery work in both directions.

Select a node in Studio and its edges take on direction: one color for what it depends on or refines, another for what depends on or refines it, with the verb written on each edge. Edges typed in the frontmatter draw solid; links inferred from a bare `[[wikilink]]` draw dashed.

The graph also computes, with no model involved: backlinks, orphan notes (nothing points at them), broken links (a wikilink to a note that does not exist), and broken waterfall (a lower-layer note with no upper-layer note it refines). These surface in `boardy check` and in Studio as warnings. Notes marked `type: brainstorming` never enter the graph.

## Quick start (planned)

> [!WARNING]
> These commands do not exist yet. They are the target interface, written down so the shape of the tool is clear before it is built.

```bash
boardy init                              # create .boardy/ with index.md, .gitignore, and the starter notes
boardy index                             # parse the markdown and build the graph index in .boardy/.index/
boardy layers                            # list the layers from index.md and the notes in each
boardy ask "why do refunds go through the ledger?"   # the matching notes and their links, with file:line
boardy fit billing-api                   # what LayerAI maps onto billing-api: skills, tools, agents
boardy add --layer technical             # open a note template for a layer
boardy link "[[a]]" "[[b]]" --type refines   # add a waterfall or typed edge
boardy check                             # report orphans, broken links, and broken waterfall
boardy status                            # note count, link count, and what changed since the last index
```

The workflow in practice:

```bash
boardy init
# write the brief, then the components, then prototypes, then the rest
boardy index
boardy layers
boardy fit "refund-endpoint"
```

`boardy` reads the folder directly and only rebuilds what changed, so the index stays current with uncommitted edits.

## CLI (planned)

`boardy --help` groups the commands into five sets.

```bash
# query
boardy ask "<question>"                 # ranked notes and their links (no LLM, no key)
boardy search "<term>"                  # full-text search over notes
boardy show <path>                      # print a note
boardy links <path>                     # every edge into and out of a note
boardy backlinks <path>                 # every note that points at this one

# layers
boardy layers                           # the layers from index.md and their notes, top to bottom
boardy brief                            # the first layer, the vision
boardy components                       # the components layer and submodules
boardy fit <path>                       # what LayerAI maps onto a note, module, or layer

# write
boardy add --layer <layer>              # open a template for a new note in a layer
boardy link <a> <b> --type <verb>       # add a typed edge to both notes
boardy unlink <a> <b>                   # remove an edge
boardy note "<title>" --layer <layer>   # add a note from text on stdin

# index and check
boardy init                             # set up the folder and gitignore
boardy index                            # rebuild the graph index
boardy index --watch                    # re-index as files change
boardy check                            # orphans, broken links, broken waterfall (exit 1 on a problem)

# status and tools
boardy status                           # counts and what changed
boardy serve                            # a local read-only graph viewer (no Tauri needed)
boardy --version
```

`boardy ask`, `boardy search`, `boardy layers`, and `boardy fit` are deterministic: they never call a model and never need a key. They rank notes by text match and by graph connectivity, so a note many others point at ranks higher.

## Skills for AI agents

The skills teach an agent to treat `.boardy/` as its first stop, the same way it treats the code.

- **Before answering a question** about the product, the agent runs `boardy ask` and reads the matching notes.
- **Before changing code** that a decision or convention covers, the agent reads that note and runs `boardy check` for conflicts.
- **Before picking a library**, the agent checks the whitelist layer and does not reach for anything outside it.
- **Before starting a task on a part**, the agent runs `boardy fit` to see which skill or tool the team already mapped to it.
- **After working something out**, the agent offers to save it as a note in the right layer. It never saves one on its own, and never edits an existing note without being asked.

The skills are plain files the agent already reads, so no server and no daemon is involved. For Claude Code, a `SKILL.md` in `.claude/skills/`. For Cursor, a rule file. For Codex and other CLIs, a section in `AGENTS.md`. Each says the same thing: where the folder is, how to query it, and when to write to it.

A teammate's agent reads the notes even before installing `boardy`, because the notes are committed files. The skill only points the agent at them.

## Studio (Tauri desktop app)

Studio is the visual editor for the same folder. It draws the waterfall and the graph, and lets you edit notes directly on them.

- **Waterfall view.** The layers stacked top to bottom, with LayerAI wrapping the outside. Each layer is a band; the notes sit inside their band. This is the first view you see.
- **Graph view.** The same notes as a linked graph. Nodes colored by layer. Click a node to open its note in a side editor. Type in the editor and the node updates live.
- **Direct editing.** Drag between two nodes to create a link, or type `[[wikilink]]` in the body. Deleting a link updates the backlinks of the other note immediately.
- **Outline view.** The notes as a collapsible tree, the waterfall first and the links beneath it.
- **Editor.** A markdown editor with live preview, autocomplete for layers, verbs, and component names, and a "what points here" panel of backlinks.
- **AI assistant, configured once.** A settings panel where you choose a provider (OpenAI-compatible, Anthropic, or a local server), model, and key. The assistant works over the notes you have written: it suggests links, flags a note that belongs in a different layer, and summarizes a group of notes. It never writes a note for you.

The assistant runs under your own key. Studio sends your prompt to the provider you configured; nothing goes through any other service.

## Tech stack

Tauri 2 and TypeScript. All product code is TypeScript; Rust appears only as the Tauri scaffold that Tauri generates, with no hand-written Rust logic. One shared TypeScript core feeds both the CLI and Studio.

**Toolchain.** TypeScript in strict mode, Node.js 22 or newer, and a pnpm monorepo (`pnpm-workspace.yaml`) with `turbo` to run build, test, and lint across the packages.

**Shared core (`packages/core`, published as `@boardy/core`, pure TypeScript, no file I/O).**

- `unified` with `remark-parse`, `remark-gfm`, `remark-wiki-link`, and `remark-frontmatter` parses markdown, tables, `[[wikilinks]]`, and frontmatter.
- `yaml` parses the frontmatter block.
- `graphology` holds the in-memory graph: nodes, edges, backlinks, and traversal.
- `minisearch` builds the full-text index and ranks results.
- `zod` validates a note's frontmatter against the layer and link schemas.

The core takes text in and returns a graph and an index out. It never touches the file system, so the CLI and Studio feed it the same way and cannot disagree about how a note is parsed.

**CLI (`packages/cli`, published as `@boardy/cli`, Node).**

- `commander` for commands and flags.
- `@clack/prompts` for the interactive prompts in `boardy init` and `boardy add`.
- `chalk` for terminal output.
- `fast-glob` to discover notes.
- `chokidar` to watch for changes in `boardy index --watch`.
- `sirv` for the local read-only viewer behind `boardy serve`.
- `tsup` bundles the CLI into a single file.

**Studio (`apps/studio`, Tauri 2 + React + TypeScript).**

- Tauri 2 with `@tauri-apps/api`.
- Tauri plugins: `plugin-fs` to read and write notes, `plugin-dialog` for open and save, `plugin-store` for the AI provider settings, and `plugin-shell` to open a note in an external editor.
- React 19 with TypeScript, built by Vite.
- `@xyflow/react` (React Flow) for the graph and waterfall views, with drag and edge editing.
- `d3-force` for the force layout.
- `@uiw/react-codemirror` with `@codemirror/lang-markdown` and `@codemirror/lang-yaml` for the editor.
- `react-markdown` with `remark-gfm` and `remark-wiki-link` for the live preview.
- `zustand` for state.
- `@mantine/core`, `@mantine/hooks`, `@mantine/form`, and `@mantine/notifications` for components and styling, and `@tabler/icons-react` for icons used only where they carry meaning.

**Quality.** `eslint` and `prettier` for lint and format, and `vitest` for tests.

## What runs where

- **On your machine, no key, no network.** Parsing, indexing, graph building, search, `boardy check`, and the Studio views are deterministic TypeScript. They never call a model.
- **Through your provider key.** Only the AI assistant's summaries and link suggestions. Studio sends them to the provider you configure, under your key, over the endpoint you set.
- **Nowhere else.** There is no server. Notes are files in your repo, shared through git like any other file.

## What stays on your machine

- **Your notes.** They are markdown files in your repo. You decide what to commit and what to keep local.
- **The index.** Derived in `.boardy/.index/`, rebuilt from the notes, and gitignored.
- **Your assistant prompts.** Sent only to the provider you configure, under your key. The tool does not store or forward them.

## Planned layout

```text
.
  packages/core/   the pure TypeScript graph engine and parser (shared)
  packages/cli/    the Node CLI
  apps/studio/        the Tauri 2 + React app
  skills/             agent skill files (Claude Code, Cursor, Codex, others)
  AGENTS.md           the package whitelist and the rules for coding agents
  RULES.md            the day-to-day rules for agents
  ARCHITECTURE.md     how the code is put together, and where each package is used
  README.md
```

## Status

This document is the specification. The core, CLI, skills, and Studio app are not built yet. The command names and file layouts above are the target, subject to change as the pieces are built.

## License

Not decided yet.
