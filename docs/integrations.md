# Optional integrations

The default installs only the shared docs and a file-tracking manifest.

## Workflows

Use `ai-playbook extras` to list names. Add one with `--with <name>`; repeat the
flag for several. `--with specs` adds `features.md` and `evals.md` templates.
`--with all` adds every available workflow and those templates.

Workflows live under `.ai-playbook/workflows/` with their references. Ask your
agent to read a workflow when needed. Selecting a native integration also puts
selected skills and agents in that tool's locations:

| Selection | Installed integration |
| --- | --- |
| `--agent codex` | Selected skills in `.agents/skills/`, agents in `.codex/agents/` |
| `--agent claude` | `CLAUDE.md` imports `AGENTS.md`; selected skills and agents in `.claude/` |
| `--agent both` | Both layouts using the same shared instructions |

The Codex core already uses `AGENTS.md`, so selecting Codex without any extras
needs no additional config file. Other coding tools can read the shared docs
and portable workflows directly; automatic discovery depends on the tool.

The old `Claude/CLAUDE.md` and `Codex/AGENTS.md` macro sources remain for existing
global links. New installations use the core templates and the small adapter in
`templates/adapters/`; they do not install those legacy macros globally.

Reinstallation retains selected extras and integrations. New native workflow
files inherit your portable workflow and references. Existing native files keep
their own edits; `--force` restores bundled files. `doctor` checks selected capabilities and
accepts customized guidance; protected validator contracts must remain intact.

## Independent review and validation

Review can be done by a human or a separate agent. The project decides when it is
required. Native read-only reviewer permissions are retained when installed.

`--with validate-feature-candidate` adds the immutable-revision validation
workflow and its contracts. A conclusive independent result requires a fresh
reviewer who did not implement or remediate the candidate. Loading the skill in
the implementing conversation does not establish independence.

Native integrations add `independent-validator` when that workflow is selected.
Without a native integration, supply the workflow to a separate capable agent.
See the [contract](../contracts/independent-validator/README.md) for pass, fail and
error semantics. The installed checker is
`.ai-playbook/contracts/independent-validator/validate.cjs`.

## Migration

Layout version 2 selected all capabilities. Migration preserves that selection,
existing docs and legacy files; it does not silently convert an existing project
to a minimal install or replace its Git policy. Old profile files stay in place,
but new installations have no stack profiles or automatic stack detection.
