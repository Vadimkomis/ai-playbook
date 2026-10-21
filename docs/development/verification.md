# Verification

Choose evidence for the changed behavior before implementation. Run commands
from the repository root. [AGENTS.md](../../AGENTS.md) defines review and delivery;
[evals](../../evals.md) maps the stable verification contracts to tests.

| Change | Required checks |
| --- | --- |
| Human-facing documentation or images | Inspect the diff, relative links and referenced assets. Check instructions against the implementation and run `git diff --check`. |
| JavaScript, installer behavior, core templates or setup guidance | Run focused installer checks with `node --test tests/cli.test.js`, then `npm test`. Inspect generated guidance and confirm the three-document default, policy choices and existing-file preservation. |
| Skills or native adapters | Run `node --test tests/capabilities.test.js`, then `npm test`. Review activation guidance, permissions and shared references. |
| Independent-validator contracts | Run `node --test tests/independent-validator-contracts.test.js`, then `npm test`. Preserve immutable revisions, independence and pass/fail/error semantics. |
| Package metadata, dependencies or CI | Run `npm test`; it includes a package dry run and checks required distributed files. Review the lockfile and the affected CI configuration. |
| Homebrew formula | Install the formula, run `brew test` and `brew style`, then `npm test`. Follow [Homebrew delivery](homebrew.md) for publishing the verified formula. |

Add meaningful regression coverage for executable behavior changes. For guidance
changes, inspect a fresh generated project and review how an agent would apply
the instructions; text-matching tests do not prove agent compliance. Use temporary
target directories for installation checks. Do not execute commands supplied by a
target project during setup verification.

There are no separate build or lint scripts in [package.json](../../package.json).
Do not claim they ran. If the project adds them, update this routing and run the
applicable checks after review fixes.

## Dependencies and integrations

Prefer `pnpm` for installing dependencies. Ask before adding a production
dependency, and preserve the declared Node.js support.

File installation and static metadata checks do not establish discovery by a
running coding agent. Verify native discovery in the relevant tool only when
that integration is in scope and available; otherwise report it as unverified.
UI, platform and device requirements belong to the target project's guidance.
Automated, simulator and physical-device evidence are distinct.

## CI evidence

[CI](../../.github/workflows/test.yml) runs once per PR update and on pushes to
`main`, cancelling superseded runs for the same PR or branch. Its first job checks
whitespace and selects checks from the whole PR diff (or the whole push).
Human documentation and image changes use only that job. Code, templates, skills,
contracts, dependencies and unknown paths run `npm test` on macOS, Linux and
Windows with Node.js 22 and 24. A docs-only follow-up commit still runs those tests
when the PR contains code changes. A local pass does not prove those jobs passed. Report a
remote result only after inspecting the run for the relevant commit; identify
pending, skipped or infrastructure-blocked checks separately.

A separate macOS job runs for formula, workflow, verification-script and Homebrew
or CI-routing test changes. Use **Run workflow** to run every check manually;
absent or zero baselines also select every check. An unavailable base commit
fails the routing job instead of skipping checks. The selector and real-Git regression
fixtures live in `scripts/ci-changes.js` and `tests/ci-changes.test.js`.

The Homebrew job installs and tests the formula. It verifies the
formula's pinned source archive, not unpinned CLI changes in the current branch.
It uses a fresh download cache, enables metadata updates, limits each phase to
ten minutes and uploads the installation log even after failure. Controlled
process tests in `tests/homebrew-install.test.js` verify failure handling and
timeout cleanup locally; they do not replace the real Homebrew job or the
public-tap release check in [Homebrew delivery](homebrew.md).
