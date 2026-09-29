const fs = require("node:fs/promises");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const SKILLS = [
  "app-localization", "architecture-reviewer", "code-simplification-architect",
  "devops-engineer", "github-actions-engineer", "mobile-engineer",
  "performance-benchmarking", "red-team-analyst", "senior-code-reviewer",
  "senior-qa-engineer", "validate-feature-candidate"
];
const EXTRAS = [...SKILLS, "specs"];
const AGENT_SKILLS = {
  "architecture-reviewer": "architecture-reviewer",
  "code-simplification-architect": "code-simplification-architect",
  "github-actions-engineer": "github-actions-engineer",
  "independent-validator": "validate-feature-candidate",
  "red-team-analyst": "red-team-analyst",
  "senior-code-reviewer": "senior-code-reviewer",
  "senior-qa-engineer": "senior-qa-engineer"
};
const READ_ONLY = ["architecture-reviewer", "red-team-analyst", "senior-code-reviewer"];
const CORE = ["AGENTS.md", "ARCHITECTURE.md", "memory.md"];

async function directoryAssets(source, destination, root = ROOT) {
  const assets = [];
  for (const entry of await fs.readdir(path.join(root, source), { withFileTypes: true })) {
    const from = `${source}/${entry.name}`;
    const to = `${destination}/${entry.name}`;
    if (entry.isSymbolicLink()) throw new Error(`Refusing symbolic link source: ${from}`);
    if (entry.isDirectory()) assets.push(...await directoryAssets(from, to, root));
    else if (entry.isFile()) assets.push({ from, to });
  }
  return assets;
}

async function optionalAssets(integrations, extras, legacy = false) {
  const assets = [];
  const skills = SKILLS.filter((skill) => extras.includes(skill));
  for (const skill of skills) {
    if (!legacy) assets.push(...await directoryAssets(`.agents/skills/${skill}`, `.ai-playbook/workflows/${skill}`));
    for (const agent of integrations) {
      const location = agent === "codex" ? ".agents" : ".claude";
      assets.push(...await directoryAssets(`.agents/skills/${skill}`, `${location}/skills/${skill}`));
    }
  }
  for (const integration of integrations) {
    if (integration === "claude") assets.push({ from: "templates/adapters/CLAUDE.md", to: "CLAUDE.md" });
    for (const [agent, skill] of Object.entries(AGENT_SKILLS)) {
      if (!skills.includes(skill)) continue;
      const from = integration === "codex" ? `Codex/agents/${agent}.toml` : `Claude/agents/${agent}.md`;
      assets.push({ from, to: `.${integration}/agents/${path.basename(from)}` });
    }
  }
  if (extras.includes("specs")) {
    for (const name of ["features.md", "evals.md"]) assets.push({ from: `templates/common/${name}`, to: name });
  }
  if (skills.includes("validate-feature-candidate")) {
    assets.push(...await directoryAssets("contracts/independent-validator", ".ai-playbook/contracts/independent-validator"));
    assets.push({ from: "src/independent-validator-contracts.js", to: ".ai-playbook/contracts/independent-validator/validate.cjs" });
  }
  return assets;
}

module.exports = { ROOT, SKILLS, EXTRAS, AGENT_SKILLS, READ_ONLY, CORE, directoryAssets, optionalAssets };
