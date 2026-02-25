const fs = require("node:fs/promises");
const path = require("node:path");

const PROFILE_DEFINITIONS = {
  "frontend-react": {
    description: "React frontend projects"
  },
  "backend-python": {
    description: "Python backend or data projects"
  },
  "backend-rust": {
    description: "Rust services or CLI projects"
  },
  "mobile-ios": {
    description: "iOS Swift/Xcode projects"
  },
  "mobile-android": {
    description: "Android Kotlin/Gradle projects"
  }
};

function repoRoot() {
  return path.resolve(__dirname, "..");
}

function helpText() {
  return [
    "ai-playbook CLI",
    "",
    "Usage:",
    "  ai-playbook init [options]",
    "  ai-playbook doctor [options]",
    "  ai-playbook profiles",
    "",
    "Options:",
    "  --target <path>       Target repo root (default: current directory)",
    "  --profile <name>      Install profile (repeatable)",
    "  --agent <value>       codex | claude | both (default: codex)",
    "  --force               Overwrite existing files",
    "  --dry-run             Print changes without writing",
    "  -h, --help            Show help"
  ].join("\n");
}

function parseArgs(argv) {
  const args = {
    command: "help",
    target: process.cwd(),
    profiles: [],
    agent: "codex",
    force: false,
    dryRun: false,
    help: false
  };

  if (argv.length > 0 && !argv[0].startsWith("-")) {
    args.command = argv[0];
  }

  for (let i = args.command === "help" ? 0 : 1; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "-h" || token === "--help") {
      args.help = true;
      continue;
    }
    if (token === "--force") {
      args.force = true;
      continue;
    }
    if (token === "--dry-run") {
      args.dryRun = true;
      continue;
    }
    if (token === "--target") {
      args.target = argv[i + 1];
      i += 1;
      continue;
    }
    if (token === "--profile") {
      args.profiles.push(argv[i + 1]);
      i += 1;
      continue;
    }
    if (token === "--agent") {
      args.agent = argv[i + 1];
      i += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${token}`);
  }

  if (!args.target) {
    throw new Error("--target expects a path");
  }
  if (!["codex", "claude", "both"].includes(args.agent)) {
    throw new Error("--agent must be one of codex|claude|both");
  }
  for (const profile of args.profiles) {
    if (!PROFILE_DEFINITIONS[profile]) {
      throw new Error(`Unknown profile: ${profile}`);
    }
  }

  return args;
}

function detectProfilesFromProject(files, packageJson) {
  const detected = new Set();
  const has = (name) => files.includes(name);

  if (has("Package.swift") || files.some((entry) => entry.endsWith(".xcodeproj"))) {
    detected.add("mobile-ios");
  }
  if (
    has("settings.gradle") ||
    has("settings.gradle.kts") ||
    has("build.gradle") ||
    has("build.gradle.kts")
  ) {
    detected.add("mobile-android");
  }
  if (has("pyproject.toml") || has("requirements.txt")) {
    detected.add("backend-python");
  }
  if (has("Cargo.toml")) {
    detected.add("backend-rust");
  }

  if (packageJson && packageJson.dependencies) {
    if (Object.prototype.hasOwnProperty.call(packageJson.dependencies, "react")) {
      detected.add("frontend-react");
    }
  }

  return Array.from(detected);
}

async function collectProjectSignals(target) {
  const entries = await fs.readdir(target, { withFileTypes: true });
  const files = entries.map((entry) => entry.name);
  let packageJson = null;
  if (files.includes("package.json")) {
    const packageJsonRaw = await fs.readFile(path.join(target, "package.json"), "utf8");
    try {
      packageJson = JSON.parse(packageJsonRaw);
    } catch {
      packageJson = null;
    }
  }
  return { files, packageJson };
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function copyFileSafe(sourcePath, destinationPath, options, result) {
  const alreadyExists = await exists(destinationPath);
  if (alreadyExists && !options.force) {
    result.skipped.push(destinationPath);
    return;
  }
  if (!options.dryRun) {
    await fs.mkdir(path.dirname(destinationPath), { recursive: true });
    await fs.copyFile(sourcePath, destinationPath);
  }
  result.copied.push(destinationPath);
}

async function copyDirectorySafe(sourceDir, destinationDir, options, result) {
  const entries = await fs.readdir(sourceDir, { withFileTypes: true });
  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const destinationPath = path.join(destinationDir, entry.name);
    if (entry.isDirectory()) {
      await copyDirectorySafe(sourcePath, destinationPath, options, result);
    } else if (entry.isFile()) {
      await copyFileSafe(sourcePath, destinationPath, options, result);
    }
  }
}

async function ensureManifest(target, payload, options) {
  const manifestPath = path.join(target, ".ai-playbook-manifest.json");
  const content = JSON.stringify(payload, null, 2) + "\n";
  if (!options.dryRun) {
    await fs.writeFile(manifestPath, content, "utf8");
  }
  return manifestPath;
}

async function installInit(args, io) {
  const target = path.resolve(args.target);
  const { files, packageJson } = await collectProjectSignals(target);
  const detectedProfiles = detectProfilesFromProject(files, packageJson);
  const profiles = args.profiles.length > 0 ? args.profiles : detectedProfiles;
  const selectedProfiles = profiles.length > 0 ? profiles : ["frontend-react"];
  const root = repoRoot();
  const result = { copied: [], skipped: [] };

  await copyFileSafe(
    path.join(root, "templates", "common", "features.md"),
    path.join(target, "features.md"),
    args,
    result
  );
  await copyFileSafe(
    path.join(root, "templates", "common", "evals.md"),
    path.join(target, "evals.md"),
    args,
    result
  );

  if (args.agent === "codex" || args.agent === "both") {
    await copyFileSafe(path.join(root, "Codex", "AGENTS.md"), path.join(target, "AGENTS.md"), args, result);
    await copyDirectorySafe(
      path.join(root, "Codex", "skills"),
      path.join(target, "Codex", "skills"),
      args,
      result
    );
  }
  if (args.agent === "claude" || args.agent === "both") {
    await copyFileSafe(
      path.join(root, "Claude", "CLAUDE.md"),
      path.join(target, "CLAUDE.md"),
      args,
      result
    );
  }

  for (const profile of selectedProfiles) {
    await copyFileSafe(
      path.join(root, "templates", "profiles", profile, "profile.md"),
      path.join(target, ".ai-playbook", "profiles", `${profile}.md`),
      args,
      result
    );
  }

  const packageJsonRaw = await fs.readFile(path.join(root, "package.json"), "utf8");
  const toolVersion = JSON.parse(packageJsonRaw).version;
  const manifestPath = await ensureManifest(
    target,
    {
      tool: "ai-playbook",
      version: toolVersion,
      installedAt: new Date().toISOString(),
      agent: args.agent,
      profiles: selectedProfiles
    },
    args
  );

  io.stdout.write(`Target: ${target}\n`);
  io.stdout.write(`Agent mode: ${args.agent}\n`);
  io.stdout.write(`Profiles: ${selectedProfiles.join(", ")}\n`);
  io.stdout.write(`Copied: ${result.copied.length}\n`);
  io.stdout.write(`Skipped: ${result.skipped.length}\n`);
  if (result.skipped.length > 0) {
    io.stdout.write("Skipped files (already existed):\n");
    for (const filePath of result.skipped) {
      io.stdout.write(`  - ${filePath}\n`);
    }
  }
  io.stdout.write(`${args.dryRun ? "Would write" : "Wrote"} manifest: ${manifestPath}\n`);
  return 0;
}

async function runDoctor(args, io) {
  const target = path.resolve(args.target);
  const checks = [
    { name: "features.md", path: path.join(target, "features.md") },
    { name: "evals.md", path: path.join(target, "evals.md") },
    { name: ".ai-playbook-manifest.json", path: path.join(target, ".ai-playbook-manifest.json") }
  ];
  const agentChecks = {
    codex: [{ name: "AGENTS.md", path: path.join(target, "AGENTS.md") }],
    claude: [{ name: "CLAUDE.md", path: path.join(target, "CLAUDE.md") }],
    both: [
      { name: "AGENTS.md", path: path.join(target, "AGENTS.md") },
      { name: "CLAUDE.md", path: path.join(target, "CLAUDE.md") }
    ]
  };
  checks.push(...agentChecks[args.agent]);

  let failures = 0;
  for (const check of checks) {
    const ok = await exists(check.path);
    io.stdout.write(`${ok ? "OK  " : "MISS"} ${check.name}\n`);
    if (!ok) {
      failures += 1;
    }
  }
  return failures === 0 ? 0 : 1;
}

function runProfiles(io) {
  io.stdout.write("Available profiles:\n");
  for (const [name, details] of Object.entries(PROFILE_DEFINITIONS)) {
    io.stdout.write(`- ${name}: ${details.description}\n`);
  }
  return 0;
}

async function run(argv, io = { stdout: process.stdout, stderr: process.stderr }) {
  const args = parseArgs(argv);
  if (args.help || args.command === "help") {
    io.stdout.write(`${helpText()}\n`);
    return 0;
  }
  if (args.command === "profiles") {
    return runProfiles(io);
  }
  if (args.command === "init") {
    return installInit(args, io);
  }
  if (args.command === "doctor") {
    return runDoctor(args, io);
  }

  io.stderr.write(`Unknown command: ${args.command}\n`);
  io.stderr.write(`${helpText()}\n`);
  return 1;
}

module.exports = {
  detectProfilesFromProject,
  parseArgs,
  run
};
