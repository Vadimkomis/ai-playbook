# Set up a project

Use this guide with any coding agent that can read and edit your project.

1. Read existing instructions, the README, code layout and documented commands.
   Reuse established decisions; clarify conflicts before changing rules.
2. For existing instructions, offer to keep the rules or review checks, protected
   behavior or data, review requirements, Git policy and additional rules. Keep
   choices the user leaves unchanged. For new setup, ask what is missing, including
   purpose and important boundaries. Suggest answers supported by the repository.
3. Fill in the [core templates](templates/core) as `AGENTS.md`, `ARCHITECTURE.md`
   and `memory.md`. Replace template fields with answers, remove template markers,
   and link existing workflow and verification docs. Keep the template's completion
   sequence when creating new guidance. Preview proposed updates to existing
   instructions and obtain confirmation before saving; preserve unrelated content.
4. Keep unresolved facts visibly open. Until the user chooses otherwise, leave
   verified changes for review; automatic commit or push requires an explicit choice.
5. Summarize the agreed rules and any open questions, then start the user's task.

Keep the documents short and editable. Put project-specific safeguards and
verification requirements in the project's guidance. Add [optional integrations](docs/integrations.md)
only when needed.
