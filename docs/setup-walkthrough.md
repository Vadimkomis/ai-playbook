# Installation walkthrough

[Watch the video](../assets/setup-walkthrough.mp4) or follow these steps.

The video uses Node.js 24 and a small example project named `demo-project`.
Its README describes the project, and its `package.json` defines `npm test`.
Use your own project's purpose, paths, commands and policies when answering.

1. Get the version of ai-playbook you're reading: on GitHub, choose **Code →
   Download ZIP** on that branch, extract it, and open the extracted folder in a
   terminal. You'll need Node.js 22 or newer.
2. Run setup, pointing it at an existing project folder. In the video, the two
   folders are next to each other:

   ```sh
   node bin/ai-playbook.js --target ../demo-project
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
   writes `.ai-playbook-manifest.json` to track the installation. The video shows
   the generated architecture and checks the installation with:

   ```sh
   node bin/ai-playbook.js doctor --target ../demo-project
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
