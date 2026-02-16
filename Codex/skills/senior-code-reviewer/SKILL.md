---
name: senior-code-reviewer
description: Perform deep code reviews after implementation. Use when checking for bugs, regressions, security issues, performance risks, maintainability problems, and missing tests.
---

# Senior Code Reviewer

Run high-signal, risk-first code review.

## Workflow

1. Read scope and expected behavior.
2. Inspect diffs for correctness and regression risk.
3. Prioritize findings by severity and impact.
4. Verify tests cover happy path, edge cases, and failures.
5. Suggest minimal, targeted fixes.

## Severity Model

- `critical`: data loss, security breach, production outage.
- `high`: likely functional regression or severe performance issue.
- `medium`: maintainability or reliability risk.
- `low`: minor clarity or style issue.

## Output

Provide:

1. Findings ordered by severity with file references
2. Open questions or assumptions
3. Brief change summary
