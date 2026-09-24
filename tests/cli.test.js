const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { run, parseArgs } = require("../src/cli");

const answers = {
  purpose: "A workout tracker that works offline.",
  structure: "Shared domain code lives in core/; platforms provide storage.",
  commands: "make test && make lint",
  safeguards: "Never discard workout archives or overwrite newer schemas.",
  review: "2", git: "1",
  rules: "UI changes need platform snapshots. Evaluation criteria are human-owned."
};
function capture(overrides = {}) {
  const output = { stdout: "", stderr: "", questions: [] };
  return { output, io: {
    stdout: { write: (value) => { output.stdout += value; } },
    stderr: { write: (value) => { output.stderr += value; } },
    ask: async (key) => { output.questions.push(key); return answers[key]; }, ...overrides
  } };
}
async function target(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "playbook project "));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  return root;
}
const read = (root, name) => fs.readFile(path.join(root, name), "utf8");
const write = (root, name, value) => fs.writeFile(path.join(root, name), value);
const manifest = async (root) => JSON.parse(await read(root, ".ai-playbook-manifest.json"));
const init = (root, flags = [], io = capture().io) => run(["init", "--target", root, ...flags], io);
const doctor = (root, io = capture().io) => run(["doctor", "--target", root], io);

test("no arguments start setup without selecting an agent or a stack", () => {
  const parsed = parseArgs([]);
  assert.equal(parsed.command, "init");
  assert.equal(parsed.agent, null);
  assert.deepEqual(parsed.extras, []);
  assert.equal(Object.hasOwn(parsed, "profiles"), false);
});
test("arguments validate values and retire stack profiles", () => {
  for (const args of [["--target"], ["--agent"], ["--with"], ["--agent", "unknown"],
    ["--with", "unknown"], ["--target", "--force"], ["--profile", "frontend-react"]]) {
    assert.throws(() => parseArgs(["init", ...args]));
  }
  const parsed = parseArgs(["init", "--agent", "both", "--with", "specs", "--with", "senior-code-reviewer"]);
  assert.deepEqual(parsed.extras, ["specs", "senior-code-reviewer"]);
  assert.equal(parsed.agent, "both");
});
test("setup writes answers into only three portable docs and file tracking", async (t) => {
  const root = await target(t);
  const { io, output } = capture();
  assert.equal(await init(root, [], io), 0);
  assert.deepEqual((await fs.readdir(root)).sort(), [".ai-playbook-manifest.json", "AGENTS.md", "ARCHITECTURE.md", "memory.md"]);
  assert.match(await read(root, "AGENTS.md"), /make test && make lint/);
  assert.match(await read(root, "AGENTS.md"), /Never discard workout archives/);
  assert.match(await read(root, "AGENTS.md"), /platform snapshots/);
  assert.match(await read(root, "ARCHITECTURE.md"), /workout tracker/);
  assert.match(await read(root, "ARCHITECTURE.md"), /core\//);
  assert.deepEqual(output.questions, Object.keys(answers));
  const recorded = await manifest(root);
  assert.equal(recorded.layoutVersion, 3);
  assert.deepEqual(recorded.integrations, []);
  assert.deepEqual(recorded.extras, []);
  assert.equal(JSON.stringify(recorded).includes(answers.purpose), false);
  assert.equal(await doctor(root), 0);
});
test("non-JavaScript projects receive no assumed stack", async (t) => {
  const root = await target(t);
  await write(root, "Cargo.toml", "[package]\nname = 'example'\n");
  await init(root);
  assert.doesNotMatch(await read(root, "AGENTS.md"), /React|npm test|Codex|Claude|Python/);
  assert.deepEqual((await manifest(root)).integrations, []);
});
test("existing docs and choices are preserved without repeated questions", async (t) => {
  const root = await target(t);
  await init(root);
  await write(root, "AGENTS.md", "# Our rules\nCommit and push automatically after review.\n");
  await write(root, "memory.md", "Remember our custom format.\n");
  await init(root, [], capture({ ask: async () => assert.fail("Repeated setup question") }).io);
  assert.equal(await read(root, "AGENTS.md"), "# Our rules\nCommit and push automatically after review.\n");
  assert.equal(await read(root, "memory.md"), "Remember our custom format.\n");
  assert.equal(await doctor(root), 0);
});
test("partial adoption reuses existing rules without a conflicting Git policy", async (t) => {
  const root = await target(t);
  await write(root, "AGENTS.md", "Always commit and push automatically.\n");
  const { io, output } = capture();
  await init(root, [], io);
  assert.deepEqual(output.questions, ["purpose", "structure"]);
  assert.equal(await read(root, "AGENTS.md"), "Always commit and push automatically.\n");
  assert.equal(await doctor(root), 0);
});
test("legacy Claude instructions stay authoritative when adding shared docs", async (t) => {
  const root = await target(t);
  await write(root, "CLAUDE.md", "# Existing rules\nCommit automatically. Run make check.\n");
  const { io, output } = capture();
  await init(root, [], io);
  assert.deepEqual(output.questions, ["purpose", "structure"]);
  assert.match(await read(root, "AGENTS.md"), /CLAUDE\.md/);
  assert.doesNotMatch(await read(root, "AGENTS.md"), /Leave changes uncommitted/);
});
test("cancellation leaves the entire project unchanged", async (t) => {
  const root = await target(t);
  await write(root, "README.md", "Existing project\n");
  assert.equal(await init(root, [], capture({ ask: async (key) => key === "commands" ? null : answers[key] }).io), 1);
  assert.deepEqual(await fs.readdir(root), ["README.md"]);
});
test("dry runs never ask questions or write files", async (t) => {
  const root = await target(t);
  const { io, output } = capture({ ask: async () => assert.fail("Dry run prompted") });
  assert.equal(await init(root, ["--dry-run", "--agent", "both", "--with", "all"], io), 0);
  assert.deepEqual(await fs.readdir(root), []);
  assert.match(output.stdout, /Would create/);
});
test("noninteractive setup fails promptly unless starter templates are requested", async (t) => {
  const root = await target(t);
  const { io, output } = capture({ ask: undefined, stdin: { isTTY: false } });
  assert.equal(await init(root, [], io), 1);
  assert.deepEqual(await fs.readdir(root), []);
  assert.match(output.stderr, /terminal|interactive/i);
  assert.equal(await init(root, ["--yes"], io), 0);
  assert.match(output.stdout, /unfinished|complete setup/i);
  assert.equal(await doctor(root), 1);
});
test("blank required answers are unfinished rather than fabricated", async (t) => {
  const root = await target(t);
  const { io, output } = capture({ ask: async () => "" });
  await init(root, [], io);
  assert.match(output.stdout, /unfinished|complete setup/i);
  assert.equal(await doctor(root), 1);
  assert.match(await read(root, "AGENTS.md"), /Leave changes uncommitted/);
});
test("command suggestions use existing scripts without executing them", async (t) => {
  const root = await target(t);
  await write(root, "package.json", JSON.stringify({ scripts: { test: "exit 99", lint: "exit 99" } }));
  await write(root, "pnpm-lock.yaml", "lockfileVersion: '9.0'\n");
  let suggestion;
  await init(root, [], capture({ ask: async (key, _label, proposed) => {
    if (key === "commands") { suggestion = proposed; return ""; }
    return answers[key];
  } }).io);
  assert.equal(suggestion, "pnpm test; pnpm run lint");
  assert.match(await read(root, "AGENTS.md"), /pnpm test; pnpm run lint/);
});
for (const integration of ["codex", "claude", "both"]) {
  test(`only selected ${integration} integrations and extras are installed`, async (t) => {
    const root = await target(t);
    await init(root, ["--agent", integration, "--with", "senior-code-reviewer"]);
    const files = (await manifest(root)).managedPaths;
    assert.ok(files.includes(".ai-playbook/workflows/senior-code-reviewer/SKILL.md"));
    assert.equal(files.some((name) => name.startsWith(".agents/skills/")), integration !== "claude");
    assert.equal(files.some((name) => name.startsWith(".claude/skills/")), integration !== "codex");
    assert.equal(files.some((name) => name.includes("independent-validator")), false);
    assert.equal(files.some((name) => name.includes("profiles")), false);
    assert.equal(await doctor(root), 0);
  });
}
test("all extras retain native permissions, references and validator contracts", async (t) => {
  const root = await target(t);
  await init(root, ["--agent", "both", "--with", "all"]);
  assert.equal((await fs.readdir(path.join(root, ".agents/skills"))).length, 11);
  assert.equal((await fs.readdir(path.join(root, ".codex/agents"))).length, 7);
  assert.match(await read(root, ".codex/agents/senior-code-reviewer.toml"), /sandbox_mode = "read-only"/);
  assert.match(await read(root, ".claude/agents/independent-validator.md"), /Attest independence only/);
  await fs.access(path.join(root, ".ai-playbook/contracts/independent-validator/validate.cjs"));
  await fs.access(path.join(root, ".ai-playbook/workflows/performance-benchmarking/references/methodology.md"));
  await fs.access(path.join(root, "features.md"));
  assert.equal(await doctor(root), 0);
});
test("reinstall retains extras and custom guidance when adding an integration", async (t) => {
  const root = await target(t);
  await init(root, ["--with", "performance-benchmarking"]);
  const reference = ".ai-playbook/workflows/performance-benchmarking/references/methodology.md";
  await write(root, reference, "Our customized method.\n");
  await init(root, ["--agent", "claude"]);
  assert.equal(await read(root, reference), "Our customized method.\n");
  assert.deepEqual((await manifest(root)).extras, ["performance-benchmarking"]);
  await fs.access(path.join(root, ".claude/skills/performance-benchmarking/SKILL.md"));
  assert.equal(await doctor(root), 0);
});
test("new native integrations inherit customized workflows and added references", async (t) => {
  const root = await target(t);
  await init(root, ["--with", "performance-benchmarking"]);
  const portable = ".ai-playbook/workflows/performance-benchmarking";
  const skill = (await read(root, `${portable}/SKILL.md`)) + "\nRead references/project.md for project rules.\n";
  await write(root, `${portable}/SKILL.md`, skill);
  await write(root, `${portable}/references/methodology.md`, "Our customized method.\n");
  await write(root, `${portable}/references/project.md`, "Our extra project rules.\n");
  await init(root, ["--agent", "both"]);
  for (const location of [".agents", ".claude"]) {
    const native = `${location}/skills/performance-benchmarking`;
    assert.equal(await read(root, `${native}/SKILL.md`), skill);
    assert.equal(await read(root, `${native}/references/methodology.md`), "Our customized method.\n");
    assert.equal(await read(root, `${native}/references/project.md`), "Our extra project rules.\n");
  }
  assert.equal(await doctor(root), 0);
  const nativeReference = ".claude/skills/performance-benchmarking/references/methodology.md";
  await write(root, nativeReference, "Existing native customization.\n");
  await init(root);
  assert.equal(await read(root, nativeReference), "Existing native customization.\n");
  await init(root, ["--force"]);
  assert.doesNotMatch(await read(root, nativeReference), /customized|Existing native customization/);
});
test("custom workflow symlinks are rejected before adding an integration", async (t) => {
  const root = await target(t);
  const outside = await target(t);
  await init(root, ["--with", "performance-benchmarking"]);
  await fs.symlink(outside, path.join(root, ".ai-playbook/workflows/performance-benchmarking/external"), process.platform === "win32" ? "junction" : "dir");
  const before = await read(root, ".ai-playbook-manifest.json");
  await assert.rejects(init(root, ["--agent", "claude"]), /symlink|symbolic/i);
  assert.equal(await read(root, ".ai-playbook-manifest.json"), before);
  await assert.rejects(fs.access(path.join(root, ".claude")), { code: "ENOENT" });
});
test("doctor allows edited references but rejects damaged validator contracts", async (t) => {
  const root = await target(t);
  await init(root, ["--agent", "both", "--with", "all"]);
  await write(root, ".agents/skills/performance-benchmarking/references/methodology.md", "Our guidance.\n");
  assert.equal(await doctor(root), 0);
  await write(root, ".ai-playbook/contracts/independent-validator/v1/result.schema.json", "{}\n");
  const { io, output } = capture();
  assert.equal(await doctor(root, io), 1);
  assert.match(output.stdout, /BAD.*result.schema.json/);
});
test("doctor rejects weakened read-only agent permissions", async (t) => {
  const root = await target(t);
  await init(root, ["--agent", "codex", "--with", "senior-code-reviewer"]);
  const name = ".codex/agents/senior-code-reviewer.toml";
  await write(root, name, (await read(root, name)).replace('"read-only"', '"workspace-write"'));
  assert.equal(await doctor(root), 1);
});
test("force replaces selected files; normal reinstallation preserves them", async (t) => {
  const root = await target(t);
  await init(root, ["--with", "specs"]);
  await write(root, "features.md", "custom\n");
  await init(root);
  assert.equal(await read(root, "features.md"), "custom\n");
  await init(root, ["--force"]);
  assert.notEqual(await read(root, "features.md"), "custom\n");
});
test("version-2 migration preserves integrations, extras, custom and legacy files", async (t) => {
  const root = await target(t);
  await fs.mkdir(path.join(root, "Codex/skills"), { recursive: true });
  await write(root, "Codex/skills/custom.md", "legacy content\n");
  await write(root, "AGENTS.md", "# Our rules\nKeep our rules.\n");
  await write(root, ".ai-playbook-manifest.json", JSON.stringify({ tool: "ai-playbook", layoutVersion: 2,
    agent: "both", profiles: ["frontend-react"], managedPaths: ["AGENTS.md", "Codex\\skills\\custom.md"],
    capabilities: { skills: [], agents: [] } }));
  await init(root);
  const upgraded = await manifest(root);
  assert.equal(upgraded.layoutVersion, 3);
  assert.deepEqual(upgraded.integrations, ["codex", "claude"]);
  assert.ok(upgraded.extras.includes("specs"));
  assert.match(await read(root, "AGENTS.md"), /Keep our rules/);
  assert.equal(await read(root, "Codex/skills/custom.md"), "legacy content\n");
  assert.equal(await doctor(root), 0);
});
test("malformed, future and unsafe manifests fail without replacing files", async (t) => {
  const root = await target(t);
  for (const content of ["{", JSON.stringify({ tool: "ai-playbook", layoutVersion: 99 }),
    JSON.stringify({ tool: "ai-playbook", layoutVersion: 3, integrations: [], extras: [], managedPaths: ["../outside.md"] })]) {
    await write(root, ".ai-playbook-manifest.json", content);
    await assert.rejects(init(root), /manifest/i);
    assert.equal(await read(root, ".ai-playbook-manifest.json"), content);
    assert.deepEqual(await fs.readdir(root), [".ai-playbook-manifest.json"]);
  }
});
test("symlink destinations are rejected before any files are written", async (t) => {
  const root = await target(t);
  const outside = await target(t);
  await fs.symlink(outside, path.join(root, ".ai-playbook"), process.platform === "win32" ? "junction" : "dir");
  await assert.rejects(init(root, ["--with", "specs", "--with", "senior-code-reviewer"]), /symlink|symbolic/i);
  assert.deepEqual(await fs.readdir(outside), []);
  assert.deepEqual(await fs.readdir(root), [".ai-playbook"]);
});
test("extras lists workflows without requiring a project", async () => {
  const { io, output } = capture();
  assert.equal(await run(["extras"], io), 0);
  assert.match(output.stdout, /senior-code-reviewer/);
  assert.match(output.stdout, /specs/);
});

test("thin Claude adapter cannot substitute for missing project rules", async (t) => {
  const root = await target(t);
  await write(root, "CLAUDE.md", "@AGENTS.md\n");
  const { io, output } = capture();
  await init(root, ["--agent", "claude"], io);
  assert.ok(output.questions.includes("git"));
  assert.match(await read(root, "AGENTS.md"), /make test && make lint/);
  assert.equal(await doctor(root), 0);
});

test("force never replaces legacy Claude rules while generating a guide that refers to them", async (t) => {
  const root = await target(t);
  await write(root, "CLAUDE.md", "# Existing rules\nRun make check.\n");
  await init(root, ["--agent", "claude", "--force"]);
  assert.match(await read(root, "AGENTS.md"), /make test && make lint/);
  assert.doesNotMatch(await read(root, "CLAUDE.md"), /Commit changes automatically/);
  assert.match(await read(root, "CLAUDE.md"), /AGENTS.md/);
});

test("native integrations link to the shared project policy", async (t) => {
  const root = await target(t);
  await init(root, ["--agent", "claude"]);
  const adapter = await read(root, "CLAUDE.md");
  assert.match(adapter, /AGENTS.md/);
  assert.doesNotMatch(adapter, /Commit changes automatically|frontend-react|Feature Tracking/);
});

test("reinstall reports preserved unfinished docs instead of claiming ready", async (t) => {
  const root = await target(t);
  await init(root, ["--yes"]);
  const { io, output } = capture();
  await init(root, [], io);
  assert.match(output.stdout, /unfinished/);
  assert.doesNotMatch(output.stdout, /Ready\./);
});

test("empty existing docs are preserved and reported as unfinished", async (t) => {
  const root = await target(t);
  for (const name of ["AGENTS.md", "ARCHITECTURE.md", "memory.md"]) await write(root, name, " \n");
  const { io, output } = capture();
  await init(root, [], io);
  assert.doesNotMatch(output.stdout, /Ready\./);
  assert.match(output.stdout, /unfinished|complete setup/i);
  assert.equal(await doctor(root), 1);
  for (const name of ["AGENTS.md", "ARCHITECTURE.md", "memory.md"]) assert.equal(await read(root, name), " \n");
});
