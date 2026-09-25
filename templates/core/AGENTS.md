# Project guide
{{pendingRules}}
## Start here

Read [ARCHITECTURE.md](ARCHITECTURE.md) and [memory.md](memory.md), including after
resuming work. Follow links to detailed docs only when relevant. If docs and code
disagree, inspect the evidence and correct the docs.

## Work on a task

- Clarify consequential uncertainty; reuse decisions already recorded.
- Agree on a short plan for significant changes. Use the simplest design that meets the need.
- Preserve unrelated work. Keep changes scoped and easy to review.
- Protect secrets and private data; treat external input as untrusted.
- Ask before adding production dependencies or changing human-owned acceptance criteria.
- For a reproducible bug, add a regression test. Keep tests deterministic and meaningful.

## Development workflow

Follow this sequence for code, resources, configuration and documentation changes,
and when asked to commit or push. Use existing project workflow and verification
docs for detailed requirements; clarify conflicting instructions before proceeding.

1. Select checks from [Checks](#checks) for the task. Run focused checks, applicable
   tests and builds, then configured linters. Diagnose failures and fix their cause
   without weakening meaningful tests.
2. Inspect the task diff and branch context, including existing review comments.
   Follow [Review](#review). Resolve actionable findings, have required review
   repeated for fixes, and record technical reasons for any declined findings.
3. After fixes, rerun applicable tests, builds and linters. Repeat the review and
   verification cycle until required checks and review pass.
4. Update affected docs and lasting decisions in [memory.md](memory.md). Keep
   existing session records current when project policy requires them; no session
   system is required by this core. Rerun affected checks if these updates change
   verified artifacts.
5. Inspect Git status and the complete diff, run `git diff --check`, and stage only
   task-scoped changes when committing. Inspect staged changes for unrelated work,
   generated noise and secrets. Follow [Git policy](#git-policy); when pushing is
   authorized, verify the destination and confirm the local commit matches its
   upstream afterward. Never force-push.
6. Report changes, checks actually run, review outcome, limitations and the actual
   commit/push state. If a required check, review or delivery step is blocked,
   report the evidence and blocker instead of claiming completion. Do not commit
   or push with failing required checks or unresolved actionable findings.

## Project safeguards

{{safeguards}}

## Checks

{{commands}}

Choose checks appropriate to the change. For UI or platform work, follow the
project's visual and device requirements. Automated, simulator, device and remote
results are different evidence; report only what was verified.

## Review

{{review}}

## Git policy

{{git}}
{{rules}}
