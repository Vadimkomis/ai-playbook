# Project memory

Keep one concise entry per PR, identified by its number or link. Save notes under
the branch name until a PR exists. Then change the heading to the PR number.
Update the same entry throughout the work. Save lasting decisions, verified
findings and unresolved pitfalls before ending a task, including blocked work.
Distinguish
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

## [PR #14](https://github.com/Vadimkomis/ai-playbook/pull/14) — Installation verification and guided policy review

The original failure was a Homebrew metadata download; its cause and an infinite
loop remain unconfirmed. CI now checks an explicit `brew update` before install,
uses a fresh cache, bounds each phase to ten minutes and retains logs. Homebrew
can continue installing after an auto-update failure, so install exit alone is
insufficient. Controlled process tests do not prove Homebrew networking works.

Release 1.3.1 was published to GitHub, Homebrew (tap `2b75a23`) and npm after
[candidate CI](https://github.com/Vadimkomis/ai-playbook/actions/runs/39494112799)
passed seven jobs. Match package/formula versions and pin verified archives.
Verify npm latest, checksum and a registry install outside this repository:
`npm exec` here can resolve an older global binary. npm upload acceptance (202)
can precede availability while scanning completes. Local Homebrew also had an
unrelated stale notifyme tap; do not confuse host state with clean-runner evidence.

Strength AI Backend upgrade preserved 83 files; doctor and repeat installation
passed. Its manifest-only commit `c10fd70` remains local. Preserve existing project
content, but offer interactive users a keep-or-review choice rather than silently
skipping policy questions. Blank review answers retain policies; preview and
confirmation precede writes. Confirmed Markdown sections supersede earlier policy
choices while unrelated text remains. Repeat reviews update those sections;
concurrent edits and malformed markers abort. Standalone Claude guidance receives
the same confirmed choices while preserving its independent text. `--yes` keeps
existing guidance; headless review requires a terminal or explicit `--yes`.

Guided review is implemented but not yet published. Verification: 84 local tests,
including 15 review cases, independent review, and real-terminal preview/save on
a temporary copy of the backend guidance. The actual backend was not rewritten.
Use plain wording for setup safeguards and memory headings.
