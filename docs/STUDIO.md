# Studio

The desktop app. All features, requirements, and tech for Studio.

## What it is

A local desktop app, built with Tauri. It draws `.boardy/` as a graph and lets you edit notes directly on it. No server, no account: everything runs on your machine.

## Open a folder

- You open a folder that is `.boardy/` itself, or the project root that contains it.
- Studio auto-discovers `.boardy/index.md`.
- If the folder is not indexed yet, Studio starts indexing when it opens.
- Studio also ensures `.boardy/.gitignore` exists, so the index stays out of git.

The notes live in `.boardy/`, not in a separate index folder. The derived index sits inside `.boardy/.index/`, ignored by git.

## Graph view

- A lightweight graph UI, fast to move around and nice to look at.
- Click a node to expand it and see everything it links to.
- Nodes are colored by layer and sized by how connected they are.
- The layers stack as a waterfall, with LayerAI wrapping the outside.

## Fast navigation

- `Cmd-K` opens a command palette for fast navigation and commands.
- Fast full-text search across all notes.

## Edit directly in the graph

- Click a node to open a floating panel on the right.
- Start editing the note right there; the node updates live.
- Drag between two nodes to link them, or type `[[wikilink]]` in the body.

## Editor

- Markdown editor with live preview.
- Autocomplete for layers, verbs, and component names.
- A "what points here" panel of backlinks.

## AI assistant (configured once)

- A settings panel: provider (OpenAI-compatible, Anthropic, or a local server), model, and key.
- The assistant works over the notes you have written: it suggests links, flags a note that belongs in a different layer, and summarizes a group of notes.
- It never writes a note for you, and it ignores `type: brainstorming` notes.

## Tech

- Tauri 2 with `@tauri-apps/api`.
- Plugins: `plugin-fs` (read and write notes), `plugin-dialog`, `plugin-store` (AI settings), `plugin-shell`.
- React 19 with TypeScript, built by Vite.
- `@xyflow/react` (React Flow) for the graph, `d3-force` for the layout.
- `@uiw/react-codemirror` with `@codemirror/lang-markdown` and `@codemirror/lang-yaml`.
- `react-markdown` with `remark-gfm` and `remark-wiki-link` for preview.
- `zustand` for state.
- `@mantine/core`, `@mantine/hooks`, `@mantine/form`, `@mantine/notifications`, and `@tabler/icons-react` for the interface.
