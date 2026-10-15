# Installation walkthrough

[Watch the video in the README](../README.md#installation-walkthrough) or follow these steps.

The video shows Homebrew setup and a small example project named `demo-project`.
Its README describes the project, and its `package.json` defines `npm test`.
Use your own project's purpose, paths, commands and policies when answering.

1. With [Homebrew](https://brew.sh) installed on macOS or Linux, install ai-playbook:

   ```sh
   brew install vadimkomis/tap/ai-playbook
   ```

   Homebrew manages Node.js for you.
2. Open a terminal in your existing project folder and run `ai-playbook`, or point
   setup at the folder from anywhere:

   ```sh
   ai-playbook --target "/path/to/your-project"
   ```

3. Answer the setup questions. These are the video's example answers:

   | Question | Example answer |
   | --- | --- |
   | Project purpose | A small app for keeping track of personal tasks. |
   | Code and boundaries | App code is in src/; tests are in test/. Keep stored tasks compatible. |
   | Checks | `npm test` |
   | Safeguards | Existing behavior, stored data and public interfaces. |
   | Review | `2` — independent review for substantial changes |
   | Git policy | `1` — leave changes for review |
   | Other rules | Ask before adding production dependencies. |

   Enter accepts a suggested answer. Setup reads existing guidance and keeps it;
   questions depend on which documents are missing. Project commands are recorded
   in the guidance and are not executed during installation.

4. Inspect `AGENTS.md`, `ARCHITECTURE.md` and `memory.md` in your project. Setup also
   writes `.ai-playbook-manifest.json` to track the installation. Check the
   installed guidance from your project folder with:

   ```sh
   ai-playbook doctor
   ```

   A complete default setup reports `OK` for all three Markdown files. If `doctor`
   reports missing or unfinished guidance, complete the listed files and rerun it.
5. Open your coding agent in your project folder and start with:

   ```text
   Read AGENTS.md, then help me [describe your task].
   ```

Edit the documents directly as the project changes. For installation without
Node.js, use [manual setup](../SETUP.md). See [integrations](integrations.md) for
optional workflows and agent-specific setup.
