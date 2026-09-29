const fs = require("node:fs/promises");
const path = require("node:path");
const { ROOT, CORE, READ_ONLY, AGENT_SKILLS, optionalAssets } = require("./catalog");
const { readManifest, readOptional, safeDestination } = require("./files");
const { PENDING } = require("./setup");

function metadata(content, key) {
  const normalized = content.replaceAll("\r\n", "\n");
  if (!normalized.startsWith("---\n")) return null;
  const end = normalized.indexOf("\n---", 4);
  return normalized.slice(4, end).match(new RegExp(`^${key}:\\s*(.+)$`, "m"))?.[1]?.trim().replace(/^["']|["']$/g, "");
}

function validGuidance(name, content) {
  if (!content.trim()) return false;
  if (name.endsWith("/SKILL.md")) {
    return metadata(content, "name") === name.split("/").at(-2) && Boolean(metadata(content, "description"));
  }
  const agent = path.basename(name).replace(/\.(toml|md)$/, "");
  if (name.startsWith(".codex/agents/")) {
    return content.includes(`name = "${agent}"`) && /developer_instructions\s*=/.test(content) &&
      content.includes(`.agents/skills/${AGENT_SKILLS[agent]}/SKILL.md`) &&
      (!READ_ONLY.includes(agent) || /^sandbox_mode\s*=\s*"read-only"\s*$/m.test(content));
  }
  if (name.startsWith(".claude/agents/")) {
    return metadata(content, "name") === agent && Boolean(metadata(content, "description")) &&
      new RegExp(`^\\s+- ${AGENT_SKILLS[agent]}\\s*$`, "m").test(content) &&
      (!READ_ONLY.includes(agent) || metadata(content, "permissionMode") === "plan" && !/\b(?:Write|Edit)\b/.test(metadata(content, "tools") || ""));
  }
  return true;
}

async function doctor(args, io) {
  const root = await fs.realpath(path.resolve(args.target));
  let manifest;
  try { manifest = await readManifest(root); }
  catch (error) { io.stdout.write(`BAD ${error.message}\n`); return 1; }
  if (!manifest) { io.stdout.write("MISS installation manifest. Run ai-playbook to set up this project.\n"); return 1; }
  const legacy = manifest.layoutVersion === 2;
  const core = legacy ? (manifest.integrations.includes("codex") ? ["AGENTS.md"] : []) : CORE;
  const assets = await optionalAssets(manifest.integrations, manifest.extras, legacy);
  const checks = [...core.map((to) => ({ to })), ...assets];
  let failures = 0;
  for (const check of checks) {
    let status = "OK";
    try {
      const file = await safeDestination(root, check.to);
      const content = await readOptional(file);
      if (content === null) status = "MISS";
      else if (check.to.startsWith(".ai-playbook/contracts/")) {
        if (content !== await fs.readFile(path.join(ROOT, check.from), "utf8")) status = "BAD";
      } else if (!validGuidance(check.to, content)) status = "BAD";
      else if (CORE.includes(check.to) && content.includes(PENDING)) status = "TODO";
    } catch { status = "BAD"; }
    io.stdout.write(`${status} ${check.to}\n`);
    if (status !== "OK") failures += 1;
  }
  if (legacy) io.stdout.write("Legacy installation. Run ai-playbook to add the portable core; existing files are preserved.\n");
  if (failures) io.stdout.write("Complete the missing setup or repair the listed files; existing guidance is never rewritten by doctor.\n");
  return failures ? 1 : 0;
}

module.exports = { doctor };
