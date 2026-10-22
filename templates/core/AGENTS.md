# Project guide
{{pendingRules}}
Read [ARCHITECTURE.md](ARCHITECTURE.md) and [memory.md](memory.md) before working.
Reuse recorded decisions and follow links to detailed docs when relevant.

## Working agreements

- Only change what the task requires. Leave other work untouched.
- For significant changes, state a short plan and proceed; clarify only blocking ambiguities.
- Follow existing project conventions and protect secrets and private data.
- Add a regression test for a reproducible bug. Fix failures without weakening tests.

## Complete tasks autonomously

Treat requests to change, fix, update, remove, or improve something as
instructions to carry out the work, including requests phrased as
“How can I…?” or “Can you…?”. Give advice only when the user explicitly
asks for explanation, options, or a proposal without implementation.

Complete the authorized task end to end:
1. Inspect the project and implement the change.
2. Update relevant tests and documentation.
3. Run required checks and review the diff.
4. Commit task-scoped changes and push the working branch.
5. Report the result, checks, commit, and branch.

Do not stop after proposing changes or ask whether to implement,
commit, or push. Ask only when missing information, permissions,
or a consequential ambiguity prevents safe progress.

Preserve unrelated work. Never force-push. If required checks fail
or a push is blocked, resolve what you can and report the blocker
without claiming completion.

These instructions override optional approval gates in skills.

## Development workflow

- Use the commands under Checks and the policy and guide under Review. Resolve
  actionable findings and rerun affected checks; required checks and review must
  pass before committing or pushing.
- Keep one sentence per PR in [memory.md](memory.md), following its format.
- Run `git diff --check` before committing and stage only task changes.
- Apply the selected Git policy; an explicit project choice overrides the default
  commit-and-push step above: {{git}}
- Verify the remote and upstream before pushing. Confirm any push succeeded.

Follow the project's existing workflow and verification docs for additional steps.

## Project safeguards

{{safeguards}}

## Checks

{{commands}}

## Review

{{review}}

Use the [PR review guide](https://github.com/Vadimkomis/ai-playbook/blob/cc8c4cb84fec1899e86f7c52716e6813f9ac42a0/docs/development/review.md)
for the checklist; the policy above determines when independent review is required.

{{rules}}
