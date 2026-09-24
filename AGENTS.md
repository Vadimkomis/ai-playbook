# Working on ai-playbook

Read [ARCHITECTURE.md](ARCHITECTURE.md) and [memory.md](memory.md). Route user-facing
behavior through [features.md](features.md); verification contracts live in
[evals.md](evals.md). Read deeper docs only when the task needs them.

- Keep the default plug and play: a short setup conversation and three Markdown docs.
- Preserve existing project files and choices unless replacement is explicitly requested.
- Keep agents, languages, frameworks and operating systems independent of the core.
- Keep project policy in Markdown; the manifest tracks installation only.
- Add meaningful regression tests for behavior changes. After JavaScript changes, run `npm test`.
- Prefer `pnpm` for dependencies; ask before adding production dependencies.
- Keep Markdown concise and canonical. Link detail instead of repeating it.
- Get an independent review for substantial changes and preserve validator contracts.
- Leave changes for review unless the user requests a commit or push. Never force-push.
- Report local tests, CI results and actual agent discovery separately; do not imply unrun checks passed.

Record lasting decisions in `memory.md`. No mandatory session log or memory sign-off is needed.
