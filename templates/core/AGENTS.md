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
- Run the applicable project checks. Fix failures without weakening tests to make them pass.
- Review the diff. Report what changed, the checks actually run, and remaining limitations.
- Update lasting decisions in the docs; keep memory concise and link details instead of repeating them.

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
