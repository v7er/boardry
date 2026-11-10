# Studio

The desktop app. All features, requirements, and tech for Studio.

## What it is

A local desktop app, built with Tauri. It opens a `.boardry/` folder, draws its notes as a layered graph, and lets you read, create, and edit notes. No server, no account: everything runs on your machine.

## Open a folder

- Open either the project root (which contains `.boardry/`) or the `.boardry/` folder itself.
- Studio finds `.boardry/index.md` either way.
- It reads the layers from `index.md`; nothing about the layer set is hardcoded.
- `.boardry/.index/` is the derived index and stays out of git.

## Views

Two views over the same folder. Switch from the header.

### Graph view

- The layers stack as a horizontal waterfall, one band per layer.
- A dashed separator line and the layer name mark each band.
- Nodes are colored by layer.
- Only the hierarchical parent link is drawn (`refines` / `part_of`), as an orthogonal polyline. Other links stay in the markdown and are not drawn.
- A **(+)** button on each node creates a child node, linked to it with `refines`.
- Click a node to expand it; click the summary to open the editor.
- Dragging a node snaps it vertically to the nearest layer band, and the band highlights. Dropping it there files the note under that layer; horizontal movement stays free.

### IDE view

- A small IDE: a file tree on the left and a markdown editor on the right.
- The tree groups notes by layer.
- The editor is CodeMirror with markdown and frontmatter support.
- Save writes the note back and refreshes the graph.

## Create a node

- **+** on a node in the graph opens the new-node dialog for a child of that node.
- Enter a name and, optionally, the content.
- The layer is inferred from the node you created from. There is no layer picker, and no kind or component field.
- Studio writes `.boardry/<layer>/<slug>.md`, links it to the parent with `refines`, and opens it.

## Edit a note

- In the graph, click a node to open the editor drawer.
- In the IDE view, pick a note from the tree and edit it inline.
- Save writes the markdown file; the graph reloads.

## Find things

- `Cmd-K` / `Ctrl-K` opens the command palette.
- Fast full-text search over every note.
- Selecting a result opens the note.

## AI

- **AI settings**: base URL, API key, model.
  - On open, it auto-detects provider env vars (`OPENAI_API_KEY`, `OPENROUTER_API_KEY`, `DEEPSEEK_API_KEY`, `GROQ_API_KEY`) and their `*_BASE_URL` / `*_MODEL`.
  - **Auto-fill from env** refills the key, base URL, and model from the environment.
  - **Fetch models** lists the provider's models for the model picker.
- **Chat**: a side panel. The prompt is sent with the top matching notes as context. It answers from `.boardry` and says when a note does not cover something.
- Brainstorming notes (`type: brainstorming`) are ignored by the graph and by AI.

## The interface

- Light and dark theme, following the OS by default, with a toggle.
- Auto refresh: Studio polls the folder and reloads when notes change on disk.
- Notes are colored by layer; the layer name labels each band.

## Tech

- Tauri 2 with `@tauri-apps/api`.
- Plugins: `plugin-dialog` (folder picker), `plugin-fs`, `plugin-shell`.
- File access for `.boardry/` goes through Rust commands (`load_boardry`, `save_note`) so hidden folders and any location work.
- AI calls go through Rust (`detect_ai_env`, `list_models`, `chat`) with `reqwest`, so there is no browser CORS limit.
- React 19 with TypeScript, built by Vite.
- `@xyflow/react` (React Flow) for the graph.
- `@mantine/core`, `@mantine/hooks`, and `@tabler/icons-react` for the interface.
- `@uiw/react-codemirror`, `@codemirror/lang-markdown`, and `@codemirror/lang-yaml` for the IDE editor.
