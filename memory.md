# Project memory

- Keep the core portable across agents, languages and operating systems; see [architecture](ARCHITECTURE.md).
- Setup should inspect, ask, write the docs and finish ready to work; see [setup](SETUP.md).
- Preserve the [README](README.md) banner and inline installation video; keep Homebrew setup, the three files and contributing easy to find.
- Homebrew installs ai-playbook itself through `vadimkomis/tap`, with Node managed by Brew; maintain the pinned package using [Homebrew delivery](docs/development/homebrew.md).
- Repository completion includes automatic commit and push after applicable checks and required review pass, unless the user asks otherwise; see the [development workflow](docs/development/workflow.md) and task-specific [verification](docs/development/verification.md).
- New projects receive the portable completion sequence inside [AGENTS.md](templates/core/AGENTS.md), preserving the three-document default and selected policies.
- Preserve custom docs and installed choices; project policy lives in Markdown, not the manifest; see [installation](README.md).
- Praesto supplies workflow lessons. Its workout, KMP, snapshot and delivery rules remain project choices; see [setup](SETUP.md).
- Independent review needs a separate reviewer; invoking a validation method in the implementing context is not independence; see [integrations](docs/integrations.md).
