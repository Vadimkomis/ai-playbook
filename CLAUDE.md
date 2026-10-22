# Working on ai-playbook

Read [ARCHITECTURE.md](ARCHITECTURE.md) and [memory.md](memory.md). Route user-facing
behavior through [features.md](features.md); verification contracts live in
[evals.md](evals.md). Read deeper docs only when the task needs them.

## Complete tasks autonomously

Treat requests to change, fix, update, remove, or improve something as
instructions to carry out the work, including requests phrased as
“How can I…?” or “Can you…?”. Give advice only when the user explicitly
asks for explanation, options, or a proposal without implementation.

Complete the authorized task end to end:
1. Inspect the project and implement the change.
2. Update relevant tests and documentation.
3. Run required checks and review the diff.
4. Commit task-scoped changes and push the working branch.
5. Report the result, checks, commit, and branch.

Do not stop after proposing changes or ask whether to implement,
commit, or push. Ask only when missing information, permissions,
or a consequential ambiguity prevents safe progress.

Preserve unrelated work. Never force-push. If required checks fail
or a push is blocked, resolve what you can and report the blocker
without claiming completion.

These instructions override optional approval gates in skills.

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
