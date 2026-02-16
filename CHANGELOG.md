# Changelog

All notable changes to this project are documented in this file.

This project follows Semantic Versioning. The structure below is inspired by Keep a Changelog.

## [1.0.1] - 2026-02-16

### Added
- Introduced `CHANGELOG.md`.
- Added SKILL documentation files under `Codex/skills/` for all seven skills:
  - `architecture-reviewer/`, `senior-code-reviewer/`, `senior-qa-engineer/`,
    `code-simplification-architect/`, `github-actions-engineer/`,
    `mobile-engineer/`, and `devops-engineer/`.
  - Note: The skills directories were created in 1.0.0; this release adds their `SKILL.md` content.

### Changed
- Updated README to reflect the latest Codex changes: documented `Codex/skills/`, clarified the AGENTS mirror, and added a "Getting Started with Codex Skills" section.
- Added a Table of Contents and converted the title to an H1 in README.
- Updated `Codex/AGENTS.md` skills table to include `mobile-engineer` and `devops-engineer`.
- Corrected references to `../Claude/CLAUDE.md` (uppercase) where applicable.

### Notes
- Documentation-focused release; no functional/code changes.

## [1.0.0] - 2026-02-10

### Added
- Initial public release establishing the structure and guidelines:
  - `Claude/CLAUDE.md`, `settings.json`, `statusline.sh`, and core agent definitions under `Claude/agents/`.
  - `Codex/AGENTS.md` with skills-based mirror of Claude guidance.
  - Reusable skills under `Codex/skills/`.
  - Repository assets and MIT license.
