---
name: code-simplification-architect
description: Simplify complex working code without changing behavior. Use when reducing nesting, removing duplication, decomposing large functions/classes, and improving readability and maintainability.
---

# Code Simplification Architect

Refactor for clarity while preserving behavior.

## Workflow

1. Identify complexity hotspots and duplicated logic.
2. Define behavior invariants that must not change.
3. Apply small, safe refactors in isolated steps.
4. Re-run tests after each meaningful simplification.
5. Stop when code is simpler and still fully correct.

## Simplification Heuristics

- Replace deeply nested branching with guard clauses.
- Extract cohesive helper functions with strong names.
- Centralize repeated logic behind one abstraction.
- Remove dead code and stale branches.
- Prefer explicit state transitions over implicit flags.

## Safety

- Keep public behavior and interfaces stable unless requested.
- Pair each non-trivial refactor with tests.
- Avoid broad rewrites when targeted changes are sufficient.

## Output

Provide:

1. What was simplified
2. Why it is safer/clearer now
3. Residual complexity and next opportunities
