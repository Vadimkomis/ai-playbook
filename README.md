<p align="center"> <img src="assets/banner.png" alt="ai-playbook banner" /> </p>
 # ai-playbook

Centralized AI coding assistant configuration for [Claude Code](https://docs.anthropic.com/en/docs/claude-code) and Codex CLI (open-source agentic coding interface — not OpenAI's legacy Codex model). This repo includes Codex-specific AGENTS and reusable skills.

## Table of Contents

- [Structure](#structure)
- [Setup](#setup)
  - [Claude Code](#claude-code)
  - [Codex](#codex)
- [What's Inside](#whats-inside)
- [Getting Started with Codex Skills](#getting-started-with-codex-skills)
- [Updating + Sanity Check](#updating--sanity-check)
- [Social Preview + README Banner](#social-preview--readme-banner)
- [Changelog](#changelog)
- [License](#license)

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
  ├── AGENTS.md          # Codex agent and workflow instructions
  └── skills/            # Reusable Codex skills (plug-and-play)
        ├── architecture-reviewer/
        ├── code-simplification-architect/
        ├── github-actions-engineer/
        ├── devops-engineer/
        ├── mobile-engineer/
        ├── senior-code-reviewer/
        └── senior-qa-engineer/
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

Tip: keep ai-playbook in a stable location (e.g. ~/dev/ai-playbook) so symlinks don’t break.

### Codex

Use the Codex playbook in two parts:

1) Project rules: copy or symlink `Codex/AGENTS.md` into your project root so Codex can pick up the shared workflow and guidelines.

```bash
ln -sf /path/to/ai-playbook/Codex/AGENTS.md /path/to/your-project/AGENTS.md
```

2) Skills: copy the skills you want into your project (or point Codex to them). Each skill is a small, focused brief you can apply during a session.

```bash
# Example: bring in a few common skills
mkdir -p /path/to/your-project/Codex/skills
rsync -a /path/to/ai-playbook/Codex/skills/architecture-reviewer \
          /path/to/ai-playbook/Codex/skills/senior-code-reviewer \
          /path/to/ai-playbook/Codex/skills/senior-qa-engineer \
          /path/to/your-project/Codex/skills/
```

## What's Inside

- **CLAUDE.md** — Universal development guidelines: pre-commit workflow, code organization principles, testing requirements, error handling, and code review checklist. Project-specific details (stack, architecture, build commands) belong in each project's own `CLAUDE.md`.
- **agents/** — Specialized agent definitions for architecture review, code simplification, QA, code review, and GitHub Actions.
- **AGENTS.md** — Codex-compatible agent and workflow instructions (mirrors Claude guidance, adapted for skills).
- **skills/** — Reusable Codex skills for targeted tasks (architecture reviews, code reviews, QA, simplification, GitHub Actions, DevOps, mobile).

## Getting Started with Codex Skills

Follow the same usage pattern as in Claude:

1. Plan — apply `skills/architecture-reviewer` to validate the approach
2. Implement — write the code
3. Review — apply `skills/senior-code-reviewer` to catch issues
4. Test — apply `skills/senior-qa-engineer` to ensure coverage
5. Simplify — apply `skills/code-simplification-architect` if the result is complex

In Codex CLI, reference the skill by path or name when creating a Task, e.g., "Use skills/architecture-reviewer on module X; focus on boundaries and failure modes."

## Updating + Sanity Check

After updating rules, agents, or skills:

```bash
# Confirm symlinks resolve correctly
ls -la ~/.claude

# Optional: verify the target file exists and is readable
cat ~/.claude/CLAUDE.md | head

# If you vendored Codex skills into a project, re-sync updated skills
rsync -a /path/to/ai-playbook/Codex/skills/ /path/to/your-project/Codex/skills/
```

If a symlink is broken, it usually means you moved the repo. Put it somewhere stable and relink.

## Social Preview + README Banner

This repo includes:
- `assets/banner.png` — used at the top of this README
- `assets/social-preview.png` — upload to GitHub → Settings → Social preview

GitHub's social preview guidance: keep the image under 1MB; 1280×640 works best.

## Changelog

See `CHANGELOG.md` for version history and release notes.

## License

MIT License — See LICENSE file for details.
