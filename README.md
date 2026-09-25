<p align="center"> <img src="assets/banner.png?v=3" alt="ai-playbook banner" /> </p>

Give your coding agent clear instructions about your project. Answer a few
questions, get three Markdown files, and start working.

## Get started

1. Download or clone this repository. You’ll need Node.js 22 or newer.
2. From the `ai-playbook` folder, run the command below with your project’s path
   and answer the setup questions:

   ```sh
   node bin/ai-playbook.js --target "/path/to/your-project"
   ```

3. Open your coding agent in your project and give it a task:

   ```text
   Read AGENTS.md, then help me [describe your task].
   ```

Prefer setup through your coding agent? Give it [SETUP.md](SETUP.md) and ask it
to follow the guide. No Node.js needed.

## What you get

| File | Purpose |
| --- | --- |
| `AGENTS.md` | How your agent should work, run checks and handle Git |
| `ARCHITECTURE.md` | How your project is organized |
| `memory.md` | Decisions and lessons to remember |

Existing files are preserved. Edit the Markdown whenever your project or
preferences change. Use it with any coding agent that can read project files.

For optional workflows and agent integrations, see [integrations](docs/integrations.md).
For all CLI options, run `node bin/ai-playbook.js --help`.

## Development

```sh
pnpm install
npm test
```

See [architecture](ARCHITECTURE.md) and [test coverage](evals.md).

- [Development workflow](docs/development/workflow.md) — implementation, review,
  documentation maintenance, commit and push.
- [Verification](docs/development/verification.md) — tests, packaging, dependencies
  and evidence requirements.

MIT — see [LICENSE](LICENSE).
