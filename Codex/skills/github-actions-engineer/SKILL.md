---
name: github-actions-engineer
description: Build, debug, and optimize GitHub Actions CI/CD workflows. Use when authoring workflow YAML, fixing failing runs, improving cache/matrix performance, tightening permissions, and hardening release pipelines.
---

# GitHub Actions Engineer

Design reliable and secure CI/CD workflows.

## Workflow

1. Confirm required triggers, jobs, and environments.
2. Validate workflow syntax, dependencies, and job graph.
3. Minimize token permissions and secret exposure.
4. Improve speed via caching, matrix strategy, and concurrency control.
5. Add clear failure diagnostics and artifacts.

## Reliability Rules

- Use explicit `permissions` with least privilege.
- Pin third-party actions to stable versions.
- Fail fast on missing required inputs.
- Use `concurrency` to prevent conflicting runs.
- Keep workflows idempotent and reproducible.

## Debugging Flow

1. Isolate first failing step from logs.
2. Reproduce locally when possible.
3. Verify runner assumptions (shell, tools, paths).
4. Patch minimally and re-run targeted workflow paths.

## Output

Provide:

1. Root cause
2. Workflow changes
3. Validation steps and residual risks
