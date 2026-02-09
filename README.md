# ai-playbook

Centralized AI coding assistant configuration for [Claude Code](https://docs.anthropic.com/en/docs/claude-code) and [Codex](https://openai.com/index/introducing-codex/).

## Structure

```
Claude/
  ├── CLAUDE.md          # Universal development guidelines (symlinked to ~/.claude/)
  ├── settings.json      # Claude Code settings
  ├── statusline.sh      # Status line configuration
  └── agents/            # Custom agent definitions
        ├── architecture-reviewer.md
        ├── code-simplification-architect.md
        ├── github-actions-engineer.md
        ├── senior-code-reviewer.md
        └── senior-qa-engineer.md

Codex/
  └── AGENTS.md          # Codex agent instructions
```

## Setup

### Claude Code

Symlink the Claude directory into your home config so all projects pick up the shared rules:

```bash
# Link shared CLAUDE.md (applies to all projects)
ln -sf /path/to/ai-playbook/Claude/CLAUDE.md ~/.claude/CLAUDE.md

# Link settings
ln -sf /path/to/ai-playbook/Claude/settings.json ~/.claude/settings.json

# Link custom agents
ln -sf /path/to/ai-playbook/Claude/agents ~/.claude/agents
```

### Codex

Copy or symlink `Codex/AGENTS.md` into your project root:

```bash
ln -sf /path/to/ai-playbook/Codex/AGENTS.md /path/to/your-project/AGENTS.md
```

## What's Inside

- **CLAUDE.md** — Universal development guidelines: pre-commit workflow, code organization principles, testing requirements, error handling, and code review checklist. Project-specific details (stack, architecture, build commands) belong in each project's own `CLAUDE.md`.
- **agents/** — Specialized agent definitions for architecture review, code simplification, QA, code review, and GitHub Actions.
- **AGENTS.md** — Codex-compatible agent instructions.

## License

MIT License — See LICENSE file for details.
