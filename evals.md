# Evals

This file defines stable evaluation contracts and their automated test mappings.
Test runners and CI are the authoritative source for pass/fail results.

## Capability distribution

- Name: Homebrew installation
- Description: The installed command creates the portable core, reports unfinished setup, preserves customized docs and installs all optional assets from the packaged source.
- Test mapping: `Formula/ai-playbook.rb` (`brew test`); see [Homebrew delivery](docs/development/homebrew.md).
- Notes: The archive is pinned by Git revision and SHA-256. Homebrew tests are separate from the Node test matrix.

- Name: Portable guided setup
- Description: The default installation asks for missing project information and writes three editable Markdown docs without selecting an agent or stack. Cancellation, dry runs and incomplete answers are reported honestly.
- Test mapping: `tests/cli.test.js`
- Notes: Reinstallation preserves existing docs and policies. Unknown noninteractive answers remain unfinished.
  Review generated workflow guidance separately; installer tests do not prove agent compliance.

- Name: Native skill and agent installation
- Description: Only explicitly selected workflows and native integrations are installed; the portable core remains available with no selected platform.
- Test mapping: `tests/cli.test.js`; `tests/capabilities.test.js`
- Notes: Combined mode installs both selected layouts. Layout version 3 tracks installation without storing project policy.

- Name: Compatibility-safe legacy migration
- Description: Version-2 selections survive migration; missing shared docs and selected native files are added without deleting legacy or user-owned files.
- Test mapping: `tests/cli.test.js`
- Notes: `--force` remains the only opt-in overwrite mechanism.

- Name: Skill activation metadata
- Description: Every canonical skill has unique valid metadata and representative direct, indirect, incomplete, and negative activation prompts.
- Test mapping: `tests/capabilities.test.js`; `tests/fixtures/skill-activation.json`
- Notes: Fixtures define the stable activation corpus; they do not call a hosted model.

- Name: Agent safety boundaries
- Description: Reviewer agents are non-editing, writer agents have explicit workspace scope, and no agent pins a model.
- Test mapping: `tests/capabilities.test.js`
- Notes: Independent validation has a separate fresh-agent boundary check.

- Name: Cross-stack performance benchmarking
- Description: The performance benchmarking skill routes known and unknown stacks, rejects incomparable evidence, approval-gates production and reusable-skill edits, and persists project-local learning.
- Test mapping: `tests/capabilities.test.js`; `tests/cli.test.js`; `tests/fixtures/skill-activation.json`
- Notes: Installation checks cover Codex and Claude reference files; deterministic content contracts cover fallback, approval, and inconclusive-result semantics. Hosted-agent pressure testing requires separately authorized delegation.

## Independent validation

- Name: Contract-valid candidate outcomes
- Description: Assignment and result documents enforce immutable revisions, command authorization, evidence coverage, outcome precedence, and deterministic failure signatures.
- Test mapping: `tests/independent-validator-contracts.test.js`
- Notes: The schema and semantic checker jointly define validity.
