# Project guide
{{pendingRules}}
Read [ARCHITECTURE.md](ARCHITECTURE.md) and [memory.md](memory.md) before working.
Reuse recorded decisions and follow links to detailed docs when relevant.

## Working agreements

- Keep changes focused and preserve unrelated work.
- Clarify missing requirements; agree on a short plan for significant changes.
- Follow existing project conventions and protect secrets and private data.
- Add a regression test for a reproducible bug. Fix failures without weakening tests.

## Development workflow

1. Run the checks relevant to the change and inspect the diff.
2. Follow the review policy below. Resolve findings and rerun affected checks.
3. Update affected docs and the PR’s single entry in [memory.md](memory.md).
   Record lasting decisions and pitfalls; never add a second entry for the same PR.
4. Before committing, run `git diff --check` and stage only task changes. Follow
   the Git policy below; never force-push. Confirm any requested push succeeded.
5. Report what changed, what was verified and anything blocked. Don't commit or
   push with failing required checks or unresolved review findings.

Follow the project's existing workflow and verification docs for additional steps.

## Project safeguards

{{safeguards}}

## Checks

{{commands}}

## Review

{{review}}

## Git policy

{{git}}
{{rules}}
