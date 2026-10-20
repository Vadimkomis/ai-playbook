const fs = require("node:fs/promises");
const path = require("node:path");
const { ROOT, CORE } = require("./catalog");
const { readOptional, safeDestination } = require("./files");

const PENDING = "<!-- ai-playbook:setup-pending -->";
const { REVIEWS, GIT, terminalPrompt, policyQuestions, askFields, isThinAdapter, commandBlock } = require("./prompts");
const { reviewExisting } = require("./review-setup");
async function suggestions(root) {
  const readme = await readOptional(path.join(root, "README.md"));
  const purpose = (readme || "").split(/\r?\n/).find((line) => /^[A-Za-z]/.test(line) && !line.includes("<")) || "";
  const files = await fs.readdir(root);
  let pkg;
  try { pkg = JSON.parse(await readOptional(path.join(root, "package.json"))); } catch { /* No suggestion. */ }
  const manager = files.includes("pnpm-lock.yaml") ? "pnpm" : files.includes("yarn.lock") ? "yarn" : "npm";
  const commands = ["test", "lint", "build"].filter((name) => typeof pkg?.scripts?.[name] === "string")
    .map((name) => `${manager}${name === "test" ? "" : " run"} ${name}`).join("; ");
  return { purpose: purpose.replace(/[\x00-\x1f\x7f]/g, "").slice(0, 180), commands };
}

async function questions(root, existing, args, io) {
  const needsArchitecture = args.force || existing["ARCHITECTURE.md"] === null;
  const claude = existing["CLAUDE.md"];
  const thinAdapter = isThinAdapter(claude);
  const legacyRules = !args.force && existing["AGENTS.md"] === null && claude !== null && !thinAdapter;
  const needsRules = (args.force || existing["AGENTS.md"] === null) && !legacyRules;
  const proposed = await suggestions(root);
  const fields = [];
  if (needsArchitecture) fields.push(
    ["purpose", "What does this project do?", proposed.purpose],
    ["structure", "Where is the main code, and what boundaries matter?", ""]
  );
  if (needsRules) fields.push(...policyQuestions(proposed));
  const prompt = fields.length && !args.yes && !args.dryRun ? terminalPrompt(io) : null;
  if (fields.length && !args.yes && !args.dryRun && !prompt) {
    io.stderr.write("Setup needs an interactive terminal. Use --yes to create starter docs, then complete them with your coding agent.\n");
    return null;
  }
  try {
    const answers = await askFields(fields, prompt, io);
    return answers && { ...answers, legacyRules };
  } finally { prompt?.close(); }
}

async function renderDocuments(answers) {
  const pendingArchitecture = !answers.purpose || !answers.structure;
  const pendingRules = !answers.commands && !answers.legacyRules;
  const values = {
    purpose: answers.purpose || "Not yet specified. Ask what the project should do before implementing features.",
    structure: answers.structure || "Not yet specified. Inspect the repository and confirm important boundaries before changing them.",
    commands: answers.commands ? commandBlock(answers.commands) : "Not yet specified. Agree on the relevant checks before changing code.",
    safeguards: answers.safeguards || "Existing behavior, stored data and public interfaces.",
    review: answers.review || REVIEWS["2"], git: answers.git || GIT["1"],
    rules: answers.rules ? `\n## Additional project rules\n\n${answers.rules}\n` : "",
    pendingArchitecture: pendingArchitecture ? `${PENDING}\n` : "",
    pendingRules: pendingRules ? `${PENDING}\n` : ""
  };
  const documents = {};
  for (const name of CORE) {
    const template = await fs.readFile(path.join(ROOT, "templates/core", name), "utf8");
    documents[name] = template.replace(/\{\{(\w+)\}\}/g, (_match, key) => values[key] ?? "");
  }
  return documents;
}

async function prepareCore(root, args, io) {
  const existing = {};
  for (const name of [...CORE, "CLAUDE.md"]) {
    await safeDestination(root, name);
    existing[name] = await readOptional(path.join(root, name));
    if (existing[name] !== null) io.stdout.write(`Found ${name}.\n`);
  }
  const reviewed = await reviewExisting(existing, args, io);
  if (reviewed === null) return null;
  const answers = await questions(root, existing, args, io);
  if (!answers) return null;
  const documents = await renderDocuments(answers);
  if (answers.legacyRules) {
    documents["AGENTS.md"] = reviewed.find((entry) => entry.to === "CLAUDE.md")?.content ?? existing["CLAUDE.md"];
  }
  const entries = CORE.map((name) => ({ to: name,
    content: !args.force && existing[name] !== null ? existing[name] : documents[name] }));
  return [...new Map([...entries, ...reviewed].map((entry) => [entry.to, entry])).values()];
}

module.exports = { PENDING, prepareCore, renderDocuments };
