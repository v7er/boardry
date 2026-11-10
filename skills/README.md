# boardry skills

Two installable agent skills, in the generic `SKILL.md` format. Any agent that reads agent skills can use them, not just Claude Code.

- `boardry-ask` - query the `.boardry/` knowledge base with the CLI.
- `boardry-note` - write a note into `.boardry/` in the right format.

## Install via npx

```bash
npx @boardry/skills                 # project level
npx @boardry/skills --global        # user level, every project
npx @boardry/skills --target DIR    # one exact skills directory
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
cp boardry-ask/SKILL.md .claude/skills/boardry-ask/SKILL.md
cp boardry-note/SKILL.md .claude/skills/boardry-note/SKILL.md
```

Restart the agent to load them.
