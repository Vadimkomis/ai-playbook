# Pull request review

Review the full PR diff against its base branch, including enough surrounding code
to understand the impact. Substantial or risky changes need a separate reviewer
who did not implement them.

- Keep PRs small and focused on one purpose. Split unrelated changes.
- Keep functions to 50 lines or fewer. Split longer functions into clear,
  meaningful operations, not compressed statements.
- Follow DRY: share repeated logic and keep documentation in one canonical place.
  Avoid abstractions that add more complexity than they remove.
- Check correctness, regressions, error handling and compatibility with existing
  behavior and data.
- Require meaningful tests for behavior changes, including relevant failure cases.
  Use the [verification guide](verification.md) for applicable checks.
- Question unnecessary dependencies, complexity and documentation. Keep names and
  instructions clear.
- Check the diff and PR commits for secrets and sensitive data, including logs,
  fixtures and assets. Use available secret scanning alongside manual inspection;
  report what was checked and any gaps.

Report suspected secrets or sensitive data to the user immediately, with the
file location, type of exposure and recommended action. Never repeat the value in
comments or logs. Block delivery until resolved; exposed credentials may need
revocation or rotation, even after removal from the latest diff.

Report actionable findings with severity, file/line references and impact.
Resolve findings and rerun affected checks before committing. State any remaining
risks or unverified checks; say when no actionable findings remain.
