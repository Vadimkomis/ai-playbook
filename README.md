# ai-playbook

Set up clear project instructions for your coding agent. Answer a few questions,
get three editable Markdown documents, and start working.

## Start

From your project folder, with Node.js 22 or newer, try this checkout:

```sh
node /path/to/ai-playbook/bin/ai-playbook.js
```

After the next release, the same setup will be available as
`npx @vadimkom/ai-playbook`. **The new setup has not been published yet.**

Setup asks about purpose, code boundaries, checks, safeguards, review and Git
policy. It suggests commands from existing package scripts and never runs them.
Press Enter to accept a suggestion or leave an unknown detail for later.

| Document | What goes inside |
| --- | --- |
| `AGENTS.md` | How to work, project rules, checks and Git policy |
| `ARCHITECTURE.md` | What the project does and its important boundaries |
| `memory.md` | Lasting decisions and recurring pitfalls |

Open your coding agent, ask it to read `AGENTS.md`, and describe your task.
Some tools discover it automatically; others need that instruction. The shared
docs work across agents, languages and operating systems. No AI account or agent
installation is needed to run setup.

Existing documents stay intact. Setup asks only for missing documents and reuses
existing instructions. Edit the Markdown whenever your preferences change;
there is no separate project configuration to maintain. An internal manifest
tracks installed files and optional additions.

## Without Node.js

Give your coding agent [SETUP.md](SETUP.md) and ask it to set up your project.
It follows the same questions and fills in the [core templates](templates/core).
The resulting Markdown needs no runtime or installed tool.

## Optional tools

```sh
ai-playbook doctor                   # Check installed files; never rewrites them
ai-playbook extras                   # List optional workflows
ai-playbook --agent claude           # Add a small adapter to the shared guide
ai-playbook --with senior-code-reviewer
```

For this checkout, use `node /path/to/ai-playbook/bin/ai-playbook.js` in place of
`ai-playbook`.
Native integration and specialist workflows are opt-in. See
[optional integrations](docs/integrations.md) for Codex, Claude, specs and validators.

## Existing installations and automation

Rerun setup to add missing files or selected extras. It retains earlier choices,
custom documents, legacy files and version-2 integrations. Existing project rules
remain authoritative; resolve contradictions in those docs before starting work.

- `--target <folder>` selects another project.
- `--dry-run` shows proposed files without asking or writing.
- `--yes` creates starter docs without questions. Unknown facts stay marked for
  completion; `doctor` reports them. Fill them in with your agent and remove the
  `ai-playbook:setup-pending` comment, or rerun with `--force` to start setup again.
- `--force` explicitly replaces selected files, including custom docs.

Cancellation before writing leaves the project intact. Setup never runs project
commands, commits or pushes. The recorded Git policy controls later agent work.

Homebrew distribution is not published. The CLI is ready to be packaged, but no
`brew install` command is advertised until a tap exists.

## Development

```sh
pnpm install
npm test
node bin/ai-playbook.js --help
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for the small implementation and
[evals.md](evals.md) for verification coverage. CI tests Node 22 and 24 on macOS,
Linux and Windows. A configured CI matrix is not evidence of a completed run.

MIT — see [LICENSE](LICENSE).
