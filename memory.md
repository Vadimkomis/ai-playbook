# Project memory

Keep one concise entry per PR, identified by its number or link. Before a PR
exists, name the entry for the branch; rename it when the PR opens. Update the
same entry throughout the work. Save lasting decisions, verified findings and
unresolved pitfalls before ending a task, including blocked work. Distinguish
confirmed facts from hypotheses; keep temporary task progress elsewhere.

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

## [PR #14](https://github.com/Vadimkomis/ai-playbook/pull/14) — Homebrew verification and memory capture

The reported failure occurred while Homebrew downloaded its package metadata,
before ai-playbook setup. A later full download succeeded; the original cause
and an infinite retry loop remain unconfirmed. CI had disabled auto-update,
leaving that path untested. Homebrew can continue installing after an auto-update
failure; check an explicit `brew update` exit before install. Exercise updates
with a fresh download cache, bound each verification phase to ten minutes,
and retain logs on failure. Controlled
process tests cover download failure and stalled descendants; they do not prove
Homebrew networking or the public tap works. The formula still tests its pinned
archive, not current branch code. Verify the public tap before declaring delivery
healthy; the shorter `brew install ai-playbook` requires homebrew-core acceptance.
Save findings before a PR exists using a branch entry, then rename that entry.
Existing project instructions remain preserved on reinstall; template changes
apply to newly generated guidance.

Release 1.3.1 includes the updated memory templates. Keep the package and Homebrew
formula versions aligned and pin the verified source archive by revision and
checksum. Existing project docs remain preserved on upgrade; new templates are
used for new guidance. GitHub, Homebrew and npm publication are separate actions.
