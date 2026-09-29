const fs = require("node:fs/promises");
const path = require("node:path");
const { ROOT, SKILLS, EXTRAS, CORE, directoryAssets, optionalAssets } = require("./catalog");
const { MANIFEST, readOptional, readManifest, safeDestination, writePlan } = require("./files");
const { prepareCore } = require("./setup");
const { doctor } = require("./doctor");

function helpText() {
  return `ai-playbook — project instructions that fit your project

Run ai-playbook in your project to answer a few questions and start working.

Usage:
  ai-playbook [init] [options]
  ai-playbook doctor
  ai-playbook extras

Options:
  --target <path>    Project folder (default: current directory)
  --agent <name>     Optional integration: codex | claude | both
  --with <extra>     Add a workflow, specs, or all (repeatable)
  --yes             Create starter docs without questions; unknown facts stay open
  --dry-run         Show proposed files without asking or writing
  --force           Replace selected files, including customized docs
  -h, --help        Show help
`;
}

function parseArgs(argv) {
  const args = { command: "init", target: process.cwd(), agent: null, extras: [], force: false, dryRun: false, yes: false, help: false };
  let index = 0;
  if (argv[0] && !argv[0].startsWith("-")) { args.command = argv[0]; index = 1; }
  const flags = { "--force": "force", "--dry-run": "dryRun", "--yes": "yes", "-h": "help", "--help": "help" };
  for (; index < argv.length; index += 1) {
    const flag = argv[index];
    if (flags[flag]) { args[flags[flag]] = true; continue; }
    if (flag === "--profile") throw new Error("Stack profiles were removed. Record project commands in AGENTS.md.");
    if (!["--target", "--agent", "--with"].includes(flag)) throw new Error(`Unknown argument: ${flag}`);
    const value = argv[++index];
    if (!value || value.startsWith("-")) throw new Error(`${flag} expects a value`);
    if (flag === "--with") {
      if (![...EXTRAS, "all"].includes(value)) throw new Error(`Unknown extra: ${value}. Run ai-playbook extras.`);
      args.extras.push(value);
    } else if (flag === "--agent") {
      if (!["codex", "claude", "both"].includes(value)) throw new Error("--agent must be codex, claude or both");
      args.agent = value;
    } else args.target = value;
  }
  return args;
}

async function projectWorkflowCopies(root, integrations, extras) {
  const copies = [];
  if (!integrations.length) return copies;
  for (const skill of SKILLS.filter((name) => extras.includes(name))) {
    const source = `.ai-playbook/workflows/${skill}`;
    await safeDestination(root, `${source}/SKILL.md`);
    let files;
    try { files = await directoryAssets(source, "", root); }
    catch (error) { if (error.code === "ENOENT") continue; throw error; }
    for (const integration of integrations) {
      const location = integration === "codex" ? ".agents" : ".claude";
      for (const file of files) copies.push({ projectFrom: file.from, to: `${location}/skills/${skill}${file.to}` });
    }
  }
  return copies;
}

async function install(args, io) {
  const root = await fs.realpath(path.resolve(args.target));
  const previous = await readManifest(root);
  const integrations = [...new Set([...(previous?.integrations || []), ...(args.agent === "both" ? ["codex", "claude"] : args.agent ? [args.agent] : [])])];
  const extras = [...new Set([...(previous?.extras || []), ...args.extras.flatMap((extra) => extra === "all" ? EXTRAS : [extra])])];
  const bundled = await optionalAssets(integrations, extras);
  const customized = args.force ? [] : await projectWorkflowCopies(root, integrations, extras);
  const assets = [...new Map([...bundled, ...customized].map((asset) => [asset.to, asset])).values()];
  // Reject unsafe destinations before prompts or any changes.
  for (const name of [...CORE, ...assets.map((asset) => asset.to)]) await safeDestination(root, name);
  const entries = await prepareCore(root, args, io);
  if (!entries) return 1;
  for (const asset of assets) {
    const source = asset.projectFrom ? await safeDestination(root, asset.projectFrom) : path.join(ROOT, asset.from);
    entries.push({ to: asset.to, content: await fs.readFile(source, "utf8") });
  }
  const version = JSON.parse(await fs.readFile(path.join(ROOT, "package.json"), "utf8")).version;
  const managedPaths = [...new Set([...(previous?.managedPaths || []), ...entries.map((entry) => entry.to)])].sort();
  entries.push({ to: MANIFEST, content: JSON.stringify({ tool: "ai-playbook", version, layoutVersion: 3,
    integrations, extras, managedPaths }, null, 2) + "\n" });
  if (args.dryRun) {
    for (const entry of entries) {
      const exists = await readOptional(path.join(root, entry.to)) !== null;
      io.stdout.write(`${exists ? args.force || entry.to === MANIFEST ? "Would update" : "Would keep" : "Would create"} ${entry.to}\n`);
    }
    return 0;
  }
  await writePlan(root, entries, args.force, io);
  const unfinished = await doctor(args, { stdout: { write() {} } });
  if (unfinished) io.stdout.write("\nDocs installed; setup is unfinished. Run ai-playbook doctor to find missing details or invalid files.\n");
  else io.stdout.write("\nReady. Open your coding agent and ask it to read AGENTS.md, then describe your task.\n");
  if (previous?.layoutVersion === 2) io.stdout.write("Upgraded file tracking; existing guidance and legacy files were retained.\n");
  return 0;
}

async function run(argv, io = { stdin: process.stdin, stdout: process.stdout, stderr: process.stderr }) {
  const args = parseArgs(argv);
  if (args.help || args.command === "help") { io.stdout.write(helpText()); return 0; }
  if (args.command === "extras") { io.stdout.write(`Optional extras:\n${EXTRAS.map((extra) => `  ${extra}`).join("\n")}\n\nAdd one with --with <name>, or --with all.\n`); return 0; }
  if (args.command === "init") return install(args, io);
  if (args.command === "doctor") return doctor(args, io);
  io.stderr.write(`Unknown command: ${args.command}\n${helpText()}`);
  return 1;
}

module.exports = { parseArgs, run };
