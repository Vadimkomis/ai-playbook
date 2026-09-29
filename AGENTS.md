# Working on ai-playbook

Read [ARCHITECTURE.md](ARCHITECTURE.md) and [memory.md](memory.md). Route user-facing
behavior through [features.md](features.md); verification contracts live in
[evals.md](evals.md). Read deeper docs only when the task needs them.

## Development workflow

- Follow [workflow](docs/development/workflow.md) for implementation, review,
  documentation maintenance, commit and push.
- Use [verification](docs/development/verification.md) to choose tests, packaging,
  documentation and integration checks before making changes.
- After applicable checks and required review pass, commit scoped changes and
  push the current branch automatically. Follow the workflow's Git policy;
  never force-push.

## Working agreements

- Keep the default plug and play: a short setup conversation and three Markdown docs.
- Preserve existing project files and choices unless replacement is explicitly requested.
- Keep agents, languages, frameworks and operating systems independent of the core.
- Keep project policy in Markdown; the manifest tracks installation only.
- Keep Markdown concise and canonical. Link detail instead of repeating it.
- Preserve independent-validator contracts and permissions.
