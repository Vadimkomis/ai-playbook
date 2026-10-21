# Product behavior

## Setup

- Running `ai-playbook` or `ai-playbook init` starts the same setup conversation.
- A new project receives `AGENTS.md`, `ARCHITECTURE.md`, `memory.md` and installation metadata.
- Questions capture purpose, code boundaries, commands, safeguards, review and Git policy.
- New `AGENTS.md` guidance includes a completion sequence: checks, review and rechecks,
  documentation maintenance, scoped Git delivery and evidence reporting. It uses the
  selected review and Git policies.
- When instructions already exist, interactive setup offers to keep or review them.
  Review asks about checks, safeguards, review, Git policy and additional rules.
  Blank answers keep existing policies. Proposed changes to `AGENTS.md` and any
  standalone `CLAUDE.md` are shown and require confirmation before writing.
- Confirmed policies explicitly supersede earlier instructions for that choice;
  other text stays unchanged. Repeat reviews update those policy sections.
  `--yes` preserves existing guidance without reviewing; `--force` replaces files.
- Setup makes evidence-based command suggestions without running project commands.
- Unknown facts stay open. Noninteractive runs require `--yes` and mark unfinished docs.
- Cancellation before writing and dry runs leave project files unchanged.
- Declining a proposed review leaves all files and installation metadata unchanged.
  If a file changes during setup, setup stops to avoid losing those changes.

## Portability and customization

- The Markdown core assumes no agent, language, framework, shell or operating system.
- Manual setup works without Node.js. The optional CLI requires Node.js 22 or newer.
- Homebrew installs the CLI and manages Node through `vadimkomis/tap/ai-playbook`;
  the formula preserves the same core, optional assets and project-file behavior.
- Stack profiles and automatic stack selection are removed.
- Optional workflows install under `.ai-playbook/workflows/`; selected native integrations
  also register them in the corresponding tool's project locations.
- Claude integration generates a standalone `CLAUDE.md` with the same initial project
  instructions as `AGENTS.md`. Existing files retain their independent edits.
- Specs, native agents and independent-validation contracts are optional.
- Existing integrations, extras and legacy files survive reinstallation and layout migration.
- New memory guidance saves lasting findings before a task ends, including blocked
  work. Save notes under the branch name until a PR exists. Then change the heading
  to the PR number.

## Verification

- `doctor` checks installed core docs and selected capabilities without executing project tools.
- Customized guidance is allowed; installed validator contracts retain integrity checks.
- Reviewer permissions and fresh-agent requirements remain enforced by the optional integrations.
- Existing localization, architecture, review, QA, security, CI, DevOps, mobile,
  simplification and performance workflows remain available through `extras`.
- Performance evidence and independent-validation result semantics remain unchanged;
  see [verification contracts](evals.md) and [integrations](docs/integrations.md).
