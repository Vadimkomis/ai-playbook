# Homebrew delivery

[Formula/ai-playbook.rb](../../Formula/ai-playbook.rb) is the canonical formula.
The public [vadimkomis/tap](https://github.com/Vadimkomis/homebrew-tap) distributes
an identical copy so users can run `brew install vadimkomis/tap/ai-playbook`.
Node is the CLI's existing runtime dependency; installation runs no npm scripts
and needs no npm development dependencies.

The formula pins a source revision and its SHA-256. Keep its version aligned with
`package.json`; new source releases do not update the tap automatically.

## Updating the package

1. Select a reviewed, tested and pushed source revision. Update the formula URL,
   version and SHA-256 of its downloaded archive. Never point at a moving branch.
   Bump `package.json` before pinning the source so the installed version matches.
2. Install from a temporary local tap containing the candidate formula. Run
   `brew test <test-tap>/ai-playbook` and `brew style <test-tap>/ai-playbook`,
   plus `npm test` in this repository. The formula test covers paths with spaces,
   unfinished setup, preservation and both optional native layouts.
   Homebrew may upgrade installed dependencies; use a disposable runner when
   testing a fresh dependency installation.
   CI selects Homebrew for formula, workflow, verification-script and related
   test changes; **Run workflow** requests it manually. See [CI evidence](verification.md#ci-evidence).
   It runs `node scripts/verify-homebrew.js` with a fresh download cache and
   metadata updates enabled. An explicit `brew update` must succeed before install:
   Homebrew can otherwise continue installing after an auto-update failure.
   Each phase has a ten-minute deadline; failure stops
   subsequent phases without an outer retry. Logs are retained as an artifact,
   including on failure. This does not guarantee dependencies are absent from
   the runner or exercise the public tap; verify both separately when releasing.
3. Obtain independent review, commit and push the source change, then copy the
   formula unchanged into `Vadimkomis/homebrew-tap/Formula/ai-playbook.rb`.
   Commit and push the tap; verify both copies match.
4. Verify `brew install vadimkomis/tap/ai-playbook` (or `brew upgrade` for an
   existing installation), then `brew test vadimkomis/tap/ai-playbook`.

For a broken update, publish the previous known-good URL and checksum with a
newer formula version/revision so existing users can upgrade to the correction.
Tool upgrades do not rewrite project guidance; users rerun setup explicitly.

## Download failures

A failure downloading `formulae.brew.sh` metadata occurs in Homebrew before
ai-playbook setup. Capture the command, Homebrew version, final error and exit
status. Repeated progress output alone does not establish an infinite loop.
Do not treat disabling auto-update or sudo as a download fix. Investigate the
failed endpoint and reproduce the public installation before claiming resolution.

`tests/homebrew-install.test.js` runs the verification script against controlled
processes to check successful sequencing, inherited update overrides, failed
downloads, missing executables and termination of stalled process groups.
These tests validate our supervisor, not Homebrew's internal retry behavior.
