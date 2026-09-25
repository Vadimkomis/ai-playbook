![ai-playbook](assets/banner.png)

Project instructions for any coding agent. A short setup conversation creates
three editable files: `AGENTS.md`, `ARCHITECTURE.md` and `memory.md`.
Existing files are preserved.

## Get started

Download or clone this repository. With Node.js 22+, run from its folder:

```sh
node bin/ai-playbook.js --target "/path/to/your-project"
```

Answer the questions, then open your coding agent in that project and say:

```text
Read AGENTS.md, then help me [describe your task].
```

Without Node.js, ask your coding agent to follow [SETUP.md](SETUP.md).

[Optional integrations](docs/integrations.md) ·
[Development workflow](docs/development/workflow.md) ·
[Verification](docs/development/verification.md) ·
[MIT license](LICENSE)
