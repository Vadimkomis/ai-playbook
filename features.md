# Product behavior

## Setup

- Running `ai-playbook` or `ai-playbook init` starts the same setup conversation.
- A new project receives `AGENTS.md`, `ARCHITECTURE.md`, `memory.md` and installation metadata.
- Questions capture purpose, code boundaries, commands, safeguards, review and Git policy.
- New `AGENTS.md` guidance includes a completion sequence: checks, review and rechecks,
  documentation maintenance, scoped Git delivery and evidence reporting. It uses the
  selected review and Git policies; session maintenance follows existing project rules.
- Existing docs remain authoritative and unchanged. Setup asks for missing documents;
  users edit established choices directly or explicitly replace files with `--force`.
- Setup makes evidence-based command suggestions without running project commands.
- Unknown facts stay open. Noninteractive runs require `--yes` and mark unfinished docs.
- Cancellation before writing and dry runs leave project files unchanged.

## Portability and customization

- The Markdown core assumes no agent, language, framework, shell or operating system.
- Manual setup works without Node.js. The optional CLI requires Node.js 22 or newer.
- Stack profiles and automatic stack selection are removed.
- Optional workflows install under `.ai-playbook/workflows/`; selected native integrations
  also register them in the corresponding tool's project locations.
- Specs, native agents and independent-validation contracts are optional.
- Existing integrations, extras and legacy files survive reinstallation and layout migration.

## Verification

- `doctor` checks installed core docs and selected capabilities without executing project tools.
- Customized guidance is allowed; installed validator contracts retain integrity checks.
- Reviewer permissions and fresh-agent requirements remain enforced by the optional integrations.
- Existing localization, architecture, review, QA, security, CI, DevOps, mobile,
  simplification and performance workflows remain available through `extras`.
- Performance evidence and independent-validation result semantics remain unchanged;
  see [verification contracts](evals.md) and [integrations](docs/integrations.md).
