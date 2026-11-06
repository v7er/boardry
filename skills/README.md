# boardy skills

Two installable agent skills, in the generic `SKILL.md` format. Any agent that reads agent skills can use them, not just Claude Code.

- `boardy-ask` - query the `.boardy/` knowledge base with the CLI.
- `boardy-note` - write a note into `.boardy/` in the right format.

## Install via npx

```bash
npx @boardy/skills                 # project level
npx @boardy/skills --global        # user level, every project
npx @boardy/skills --target DIR    # one exact skills directory
```

## Where they go

Without flags, the installer writes each skill to several common skill directories so different agents can find them:

| Agent | Project level | User level (`--global`) |
|---|---|---|
| Claude Code | `.claude/skills/` | `~/.claude/skills/` |
| Cursor | `.cursor/skills/` | `~/.cursor/skills/` |
| generic | `.agents/skills/` | `~/.agents/skills/` |

If your agent reads skills from somewhere else, pass `--target <dir>`.

## Manual install

```bash
mkdir -p .claude/skills
cp boardy-ask/SKILL.md .claude/skills/boardy-ask/SKILL.md
cp boardy-note/SKILL.md .claude/skills/boardy-note/SKILL.md
```

Restart the agent to load them.
