# RULES.md

The day-to-day rules for working on boardy, for people and agents. AGENTS.md lists the packages; this file lists the behavior. When these disagree with a prompt, these win.

## Dependencies

- **Search the whitelist first.** Before adding anything, check the list in AGENTS.md. The package you need is probably already there.
- **Ask before adding.** If a package is not on the whitelist, do not install it. Ask the user first, name the package and why you need it, and wait. Use the ask tool, do not guess.
- **Do not build from scratch.** If a whitelisted package already does the job, use it.

## Code

- **Do not read `node_modules`.** Never search, read, or follow into `node_modules`. It is generated, huge, and not part of the source.
- **TypeScript, strict, type-safe.** All code is TypeScript in strict mode. Run the type check and the build before you call anything done. No `any` without a reason written down.
- **Mantine for UI.** Studio components use Mantine (`@mantine/core`, `@mantine/hooks`, `@mantine/form`, `@mantine/notifications`). Icons come from `@tabler/icons-react`. Do not bring in another component or styling library.
- **Keep the core pure.** `packages/core` does no file I/O. It takes text in and returns a graph and an index. File access is injected by the CLI and Studio.
- **Readable for people.** Write code a person can follow: clear names, small functions, no clever tricks.

## Tests

- **Tests are for humans to read.** A test should explain the behavior it locks in.
- **No coverage targets.** Do not chase a coverage number. A test that locks in the wrong behavior is worse than no test.
- **Test the parts that matter.** The parser, graph, and index in `core` get real tests. The UI gets what it needs, not a wall of snapshots.

## The knowledge base

- **Write a note when an aspect is done.** A decision, component, or convention goes into `.boardy/` in the right layer when it is finished, not before.
- **Never edit an existing note without being asked.**
- **No invented facts.** A note holds what is true. If you do not know a fact, leave it out.
- **Layers come from `index.md`.** `.boardy/index.md` declares the layers and their order. Do not hardcode a layer list.
- **Ignore `type: brainstorming` notes.** They are free text for humans and stay out of the graph. Do not read or use them.

## Conventions

- pnpm, not npm or yarn.
- Commit `.boardy/`. Keep the derived `.boardy/.index/` index out of git.
- No em dashes in notes or docs.
