# Working on ai-playbook

Read [ARCHITECTURE.md](ARCHITECTURE.md) and [memory.md](memory.md). Route user-facing
behavior through [features.md](features.md); verification contracts live in
[evals.md](evals.md). Read deeper docs only when the task needs them.

## Development workflow

- Run applicable checks from [verification](docs/development/verification.md).
- Follow the [PR review guide](docs/development/review.md). Get independent review
  for substantial or risky changes; resolve findings and rerun affected checks.
- Update affected docs and keep one sentence per PR in [memory.md](memory.md)
  summarizing what changed. Use the branch name until a PR exists, then rename
  the heading. Update the same sentence; keep implementation details, test
  results and task progress in the PR description or relevant docs.
- Inspect the diff, run `git diff --check`, and stage only task-scoped changes.
- After checks and required review pass, commit and push the current branch unless
  asked otherwise. Verify the remote and upstream; never force-push. Confirm the push succeeded.
- Report checks actually run, blockers and commit/push status. Distinguish local
  tests, CI results and actual agent discovery.

## Working agreements

- Keep the default plug and play: a short setup conversation and three Markdown docs.
- Preserve existing project files and choices unless replacement is explicitly requested.
- Keep agents, languages, frameworks and operating systems independent of the core.
- Keep project policy in Markdown; the manifest tracks installation only.
- Keep Markdown concise and canonical. Link detail instead of repeating it.
- Preserve independent-validator contracts and permissions.
