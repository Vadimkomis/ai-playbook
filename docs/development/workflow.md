# Development workflow

Follow this process for source, template, configuration and documentation changes,
and when asked to commit or push. Read [AGENTS.md](../../AGENTS.md) first; choose
applicable checks from [verification.md](verification.md) before implementation.

1. Establish the task scope and acceptance criteria. Preserve unrelated work and
   existing project choices. Agree on a short plan for substantial changes.
2. Implement the change and run focused checks, then applicable tests and packaging
   checks. Run configured linters after tests pass. Diagnose failures, fix their
   cause and rerun affected checks without weakening meaningful tests.
3. Inspect the intended task diff and its branch context. Use the pull request's
   base when known, otherwise the remote default branch. Address existing review
   comments. Obtain independent review for substantial or risky changes; use a
   human or separate agent that did not implement the change. Review Markdown for
   clarity, necessary content, repetition and stale instructions.
4. Resolve actionable findings and have the fixes reviewed. Record a technical
   reason for any finding intentionally declined. After fixes, rerun applicable
   tests, packaging checks and configured linters; repeat until checks and review
   pass. Unchanged, already verified work does not need another identical run.
5. Update affected project docs, including [features](../../features.md) and
   [evals](../../evals.md) when behavior or verification contracts change. Record
   lasting decisions in [memory](../../memory.md), linking canonical detail.
   This repository requires no session log or memory sign-off. If maintenance
   changes verified artifacts, rerun affected checks before continuing.
6. Inspect Git status and the complete diff, run `git diff --check`, and stage only
   task-scoped changes. Inspect the staged diff for unrelated work, generated noise
   and secrets.
7. Apply the Git policy below. Report what changed, checks actually run, review
   outcome, blockers and the resulting commit/push state. Distinguish local tests,
   CI and actual native-agent discovery.

If a required check or review is unavailable or fails, report the evidence and
blocker. Do not commit or push with failing required checks or unresolved
actionable findings, and do not describe blocked work as complete.

## Git policy

Commit verified, scoped changes automatically after required review passes.
Push only when the user requests it; never force-push. For an authorized push,
confirm the current branch and remote, set its upstream if absent, then verify
that the local commit matches the upstream. A rejected push remains a blocker;
report it and preserve the local commit.

This policy governs ai-playbook development. Installed projects use the Git and
review policies selected during [setup](../../SETUP.md).
