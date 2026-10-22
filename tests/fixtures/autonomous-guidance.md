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
