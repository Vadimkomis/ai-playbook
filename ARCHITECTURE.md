# How ai-playbook works

ai-playbook helps a coding agent understand a project through three Markdown docs.
The optional Node.js CLI asks setup questions and installs them. The docs need no runtime.

| Location | Responsibility |
| --- | --- |
| `bin/ai-playbook.js` | Executable entry point and error reporting |
| `src/cli.js` | Arguments, commands and installation orchestration |
| `src/setup.js` | Questions, evidence-based suggestions and doc rendering |
| `src/files.js` | Safe destinations, preservation and manifest migration |
| `src/catalog.js` | Optional workflows and native integration file mappings |
| `src/doctor.js` | Checks for installed files, metadata, permissions and contracts |
| `templates/core/` | The shared project documents |
| `docs/development/` | This repository's completion workflow and verification routing |
| `.agents/skills/`, `Codex/agents/`, `Claude/` | Optional workflows and native adapters |
| `contracts/`, `src/independent-validator-contracts.js` | Independent validation contracts |
| `tests/` | Installer, packaging, capability and contract checks |

Setup collects answers before writing. Existing docs remain authoritative; missing
docs are added. Project commands are recorded as text and never executed by setup.
The version-3 manifest stores file paths and selected extras, not project policy.
Version-2 installations retain their existing integrations and content during migration.

Native adapters refer to the shared guidance. They keep platform permissions and
independence requirements; the Markdown core has no native-tool dependency.
See [integrations](docs/integrations.md) and [manual setup](SETUP.md).
