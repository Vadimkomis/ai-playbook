const fs = require("node:fs/promises");
const path = require("node:path");
const readline = require("node:readline");
const { ROOT, CORE } = require("./catalog");
const { readOptional, safeDestination } = require("./files");

const PENDING = "<!-- ai-playbook:setup-pending -->";
const REVIEWS = {
  "1": "Review the diff and verification evidence before finishing.",
  "2": "Get an independent review for substantial or risky changes. A human or a separate agent can review; self-review is not independent.",
  "3": "Get an independent review for every change. A human or a separate agent can review; self-review is not independent."
};
const GIT = {
  "1": "Leave changes uncommitted for review unless the user requests a commit or push.",
  "2": "Commit scoped changes automatically after checks and required review pass. Push only when requested.",
  "3": "Commit scoped changes and push the current branch automatically after checks and required review pass. Never force-push."
};

function terminalPrompt(io) {
  if (io.ask) return { ask: io.ask, close() {} };
  const input = io.stdin || process.stdin;
  if (!input.isTTY) return null;
  const terminal = readline.createInterface({ input, output: io.stdout, terminal: true });
  let closed = false;
  let pending;
  const cancel = () => { closed = true; if (pending) pending(null); terminal.close(); };
  terminal.on("SIGINT", cancel);
  terminal.on("close", () => { closed = true; if (pending) pending(null); });
  return {
    ask: (_key, label, proposed) => new Promise((resolve) => {
      if (closed) return resolve(null);
      pending = resolve;
      terminal.question(`${label}${proposed ? ` [${proposed}]` : ""}\n> `, (answer) => {
        pending = null;
        resolve(answer);
      });
    }),
    close: () => terminal.close()
  };
}

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
  const thinAdapter = claude !== null && /^\s*(?:#.*\n\s*)?@AGENTS\.md\s*$/.test(claude);
  const legacyRules = !args.force && existing["AGENTS.md"] === null && claude !== null && !thinAdapter;
  const needsRules = (args.force || existing["AGENTS.md"] === null) && !legacyRules;
  const proposed = await suggestions(root);
  const fields = [];
  if (needsArchitecture) fields.push(
    ["purpose", "What does this project do?", proposed.purpose],
    ["structure", "Where is the main code, and what boundaries matter?", ""]
  );
  if (needsRules) fields.push(
    ["commands", "Which commands check changes? (tests, lint, build)", proposed.commands],
    ["safeguards", "What behavior or data must changes preserve?", "Existing behavior, stored data and public interfaces."],
    ["review", "Review: 1) self-review  2) independent for substantial changes  3) independent for every change", "2", REVIEWS],
    ["git", "After checks and review: 1) leave changes for review  2) commit  3) commit and push", "1", GIT],
    ["rules", "Any other rules? (screenshots, evaluation criteria, dependencies; Enter to skip)", ""]
  );
  const prompt = fields.length && !args.yes && !args.dryRun ? terminalPrompt(io) : null;
  if (fields.length && !args.yes && !args.dryRun && !prompt) {
    io.stderr.write("Setup needs an interactive terminal. Use --yes to create starter docs, then complete them with your coding agent.\n");
    return null;
  }
  const answers = { legacyRules };
  try {
    for (const [key, label, defaultValue, choices] of fields) {
      let answer;
      do {
        answer = prompt ? await prompt.ask(key, label, defaultValue) : "";
        if (answer === null || answer === undefined) { io.stdout.write("Setup cancelled; no files changed.\n"); return null; }
        answer = String(answer).trim() || defaultValue;
        if (choices && !choices[answer]) io.stdout.write("Choose 1, 2 or 3.\n");
      } while (choices && !choices[answer]);
      answers[key] = choices ? choices[answer] : answer;
    }
  } finally { prompt?.close(); }
  return answers;
}

function commandBlock(commands) {
  const longest = Math.max(2, ...(commands.match(/`+/g) || []).map((item) => item.length));
  const fence = "`".repeat(longest + 1);
  return `${fence}text\n${commands}\n${fence}`;
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
  if (answers.legacyRules) {
    documents["AGENTS.md"] = "# Project guide\n\nRead [ARCHITECTURE.md](ARCHITECTURE.md) and [memory.md](memory.md) first.\nFollow the existing project workflow, checks, safeguards and Git policy in\n[CLAUDE.md](CLAUDE.md). These are shared project instructions, regardless of your coding tool.\n\nKeep lasting decisions in the project docs; clarify conflicts before changing them.\n";
  }
  return documents;
}

async function prepareCore(root, args, io) {
  const existing = {};
  for (const name of [...CORE, "CLAUDE.md"]) {
    await safeDestination(root, name);
    existing[name] = await readOptional(path.join(root, name));
    if (existing[name] !== null) io.stdout.write(`Found ${name}; ${args.force && name !== "CLAUDE.md" ? "replacement requested" : "keeping existing guidance"}.\n`);
  }
  const answers = await questions(root, existing, args, io);
  if (!answers) return null;
  const documents = await renderDocuments(answers);
  return CORE.map((name) => ({ to: name, content: !args.force && existing[name] !== null ? existing[name] : documents[name] }));
}

module.exports = { PENDING, prepareCore, renderDocuments };
