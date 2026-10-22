# Project memory

Keep one sentence per PR summarizing what changed, identified by its number or
link. Use the branch name until a PR exists, then rename the heading. Update the
same entry throughout the work; keep implementation details and test results in
the PR description and relevant documentation.

## [PR #13](https://github.com/Vadimkomis/ai-playbook/pull/13) — Memory and simpler setup

Keep setup to a short conversation and three portable Markdown docs. Preserve
existing files and choices; make integrations optional. Keep the development
workflow in [AGENTS.md](AGENTS.md), with separate [review](docs/development/review.md)
and [verification](docs/development/verification.md) guides. Preserve the README banner,
installation video and Homebrew instructions. Keep reusable guidance in
`templates/core/`; generate standalone agent instruction files without imports
between them. Keep root `AGENTS.md` and `CLAUDE.md` identical and standalone.
Retain a compatibility pointer for existing global Claude links.
Keep memory to one entry per PR.

## [PR #14](https://github.com/Vadimkomis/ai-playbook/pull/14) — Installation verification and guided policy review

Improved Homebrew checks, added guided policy review, reduced unnecessary CI runs, and made concise PR memory and automatic commit-and-push the defaults for new projects.
