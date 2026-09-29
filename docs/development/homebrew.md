# Homebrew delivery

[Formula/ai-playbook.rb](../../Formula/ai-playbook.rb) is the canonical formula.
The public [vadimkomis/tap](https://github.com/Vadimkomis/homebrew-tap) distributes
an identical copy so users can run `brew install vadimkomis/tap/ai-playbook`.
Node is the CLI's existing runtime dependency; installation runs no npm scripts
and needs no npm development dependencies.

The initial `1.3.0-preview.1` formula packages guided setup from revision
`4dcc356527041786505afd265a122ea295dd497d`. It is a Homebrew preview, not a new
npm release; the source package metadata still reports `1.2.0`.

## Updating the package

1. Select a reviewed, tested and pushed source revision. Update the formula URL,
   version and SHA-256 of its downloaded archive. Never point at a moving branch.
   Use a newer preview version until guided setup has a stable release.
2. Install from a temporary local tap containing the candidate formula. Run
   `brew test <test-tap>/ai-playbook` and `brew style <test-tap>/ai-playbook`,
   plus `npm test` in this repository. The formula test covers paths with spaces,
   unfinished setup, preservation and both optional native layouts.
   Homebrew may upgrade installed dependencies; use a disposable runner when
   testing a fresh dependency installation.
3. Obtain independent review, commit and push the source change, then copy the
   formula unchanged into `Vadimkomis/homebrew-tap/Formula/ai-playbook.rb`.
   Commit and push the tap; verify both copies match.
4. Verify `brew install vadimkomis/tap/ai-playbook` (or `brew upgrade` for an
   existing installation), then `brew test vadimkomis/tap/ai-playbook`.

For a broken update, publish the previous known-good URL and checksum with a
newer formula version/revision so existing users can upgrade to the correction.
Tool upgrades do not rewrite project guidance; users rerun setup explicitly.
