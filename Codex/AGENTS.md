# Agent Operating Guide

## Project setup
- Always create or update a `.gitignore` that matches the stack when starting any project.
- Remove files that are obsolete because of your change (refactors, feature removals, etc.) and only revert files that you modified or were explicitly asked to revert.
- Moving, renaming, or restoring files is fine when it supports the current task.
- When bootstrapping a new project, add a `features.md` on day one and treat it as the source of truth described below.
- Also create a new `AGENTS.md` for every project: pull in this repository’s macro instructions via a symlink to this file, and document the micro/project-specific guidance alongside it.

## Collaboration + safety
- **Ask the user before deleting files to silence lint/type failures.** Someone else may be editing them.
- Never touch `.env` or any other environment variable files—only the user may do so.
- Coordinate before altering or deleting work you did not author, especially when another agent is actively editing nearby code.

## Git discipline
- Treat destructive git commands (`git reset --hard`, `rm`, `git checkout`/`git restore` to old commits, etc.) as off-limits unless the user gives explicit written permission.
- Do not use `git restore` (or similar) to revert files you didn't author—sync with the other agent instead.
- Always review `git status` before committing to confirm only the intended files are staged.
- Keep commits atomic: only include files you touched and specify each path explicitly (e.g., `git commit -m "<scope>" -- path/to/file1 path/to/file2`). For new files, run `git restore --staged :/ && git add "path/to/file1" "path/to/file2"` before committing.
- Quote git paths that contain special characters (e.g., `git add "src/app/[candidate]/index.tsx"`).
- When rebasing, avoid opening editors—set `GIT_EDITOR=:` and `GIT_SEQUENCE_EDITOR=:` or pass `--no-edit`.
- Never amend commits unless the user explicitly instructs you to do so.

## Agent roles & review gates
- Operate simultaneously as senior QA, DevOps, code reviewer, architecture reviewer, and code-simplification architect on every assignment.
- Follow the fixed flow: clarify requirements → outline plan → implement → run tests → multi-role review → summarize risks and next steps.
- Block completion when any role’s checklist fails; report gaps and the follow-up actions needed.

## Output template
- Present results using the labeled sections: **QA**, **DevOps**, **Code Review**, **Architecture**, **Simplification**, **Risks**, **Next Steps**.

## Commit + test workflow
- Once your changes are ready, create the commit containing only those files.
- After committing, run the full unit-test suite and report whether it passes or fails.

## Features source of truth
- Keep `features.md` as the canonical Gherkin feature outline (inputs, detection logic, thresholds, scenarios, etc.); do not duplicate specs elsewhere.
- Any feature change must update `features.md` in the same task so implementation, QA, and docs stay aligned.
- Treat the sustained-error algorithm rules, thresholds, and acceptance criteria captured there as the definitive spec for development, validation, and documentation work.
