# Working on ai-playbook

Read [ARCHITECTURE.md](ARCHITECTURE.md) and [memory.md](memory.md). Route user-facing
behavior through [features.md](features.md); verification contracts live in
[evals.md](evals.md). Read deeper docs only when the task needs them.

## Development workflow

- Run applicable checks from [verification](docs/development/verification.md).
- Get independent review for substantial changes. Resolve actionable findings and
  rerun affected checks before committing.
- Update affected docs and record lasting decisions in [memory.md](memory.md).
- Inspect the diff, run `git diff --check`, and stage only task-scoped changes.
- After checks and required review pass, commit and push the current branch unless
  asked otherwise. Verify the remote and upstream; never force-push.
- Report checks actually run, blockers and commit/push status. Distinguish local
  tests, CI results and actual agent discovery.

## Working agreements

- Keep the default plug and play: a short setup conversation and three Markdown docs.
- Preserve existing project files and choices unless replacement is explicitly requested.
- Keep agents, languages, frameworks and operating systems independent of the core.
- Keep project policy in Markdown; the manifest tracks installation only.
- Keep Markdown concise and canonical. Link detail instead of repeating it.
- Preserve independent-validator contracts and permissions.
