const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const os = require("node:os");
const { run } = require("../src/cli");

async function project(t) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "playbook-review-"));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const files = {
    "AGENTS.md": "# Custom rules\nNever log tokens.\nCommit automatically.\n",
    "CLAUDE.md": "# Independent Claude rules\nKeep uploads private.\n",
    "ARCHITECTURE.md": "# Architecture\nFastAPI backend.\n",
    "memory.md": "# Memory\nPreserve stored videos.\n",
  };
  for (const [name, text] of Object.entries(files)) await fs.writeFile(path.join(root, name), text);
  return { root, files };
}

function dialogue(replies = {}, onAsk = () => {}) {
  const output = { text: "", keys: [] };
  return { output, io: {
    stdout: { write: (text) => { output.text += text; } },
    stderr: { write: (text) => { output.text += text; } },
    ask: async (key, label, proposed) => {
      output.keys.push(key);
      await onAsk(key, output);
      return Object.hasOwn(replies, key) ? replies[key] :
        ({ existingRules: "2", review: "2", git: "1", confirmRules: "yes",
          commands: "pytest -q", safeguards: "Keep tenant isolation.", rules: "" }[key] ?? proposed);
    },
  } };
}

test("existing rules are reviewed and previewed before confirmed changes are written", async (t) => {
  const { root, files } = await project(t);
  const { io, output } = dialogue({}, async (key, output) => {
    if (key !== "confirmRules") return;
    assert.match(output.text, /pytest -q/);
    assert.match(output.text, /Leave changes uncommitted/);
    for (const [name, text] of Object.entries(files)) {
      assert.equal(await fs.readFile(path.join(root, name), "utf8"), text);
    }
    await assert.rejects(fs.access(path.join(root, ".ai-playbook-manifest.json")));
  });
  assert.equal(await run(["--target", root, "--agent", "claude"], io), 0);
  assert.deepEqual(output.keys, ["existingRules", "commands", "safeguards", "review", "git", "rules", "confirmRules"]);
  for (const name of ["AGENTS.md", "CLAUDE.md"]) {
    const text = await fs.readFile(path.join(root, name), "utf8");
    assert.ok(text.startsWith(files[name]));
    assert.match(text, /pytest -q/);
    assert.match(text, /Leave changes uncommitted/);
  }
  for (const name of ["ARCHITECTURE.md", "memory.md"]) {
    assert.equal(await fs.readFile(path.join(root, name), "utf8"), files[name]);
  }
});

for (const reply of ["no", null]) test(`declining or cancelling confirmation (${reply}) leaves every file unchanged`, async (t) => {
  const { root, files } = await project(t);
  const { io } = dialogue({ confirmRules: reply });
  assert.equal(await run(["--target", root], io), 1);
  assert.deepEqual((await fs.readdir(root)).sort(), Object.keys(files).sort());
  for (const [name, text] of Object.entries(files)) assert.equal(await fs.readFile(path.join(root, name), "utf8"), text);
});

test("blank review answers keep existing policies without introducing defaults", async (t) => {
  const { root, files } = await project(t);
  const { io } = dialogue({ commands: "", safeguards: "", review: "0", git: "0", rules: "" });
  assert.equal(await run(["--target", root], io), 0);
  for (const [name, text] of Object.entries(files)) assert.equal(await fs.readFile(path.join(root, name), "utf8"), text);
});

test("repeat review updates only its previous policy sections and keeps skipped choices", async (t) => {
  const { root } = await project(t);
  assert.equal(await run(["--target", root], dialogue().io), 0);
  const { io } = dialogue({ commands: "pytest tests/ -q", safeguards: "", review: "0", git: "0" });
  assert.equal(await run(["--target", root], io), 0);
  const text = await fs.readFile(path.join(root, "AGENTS.md"), "utf8");
  assert.equal(text.includes("pytest -q"), false);
  assert.match(text, /pytest tests\/ -q/);
  assert.match(text, /Keep tenant isolation/);
  assert.equal((text.match(/Leave changes uncommitted/g) || []).length, 1);
});

test("edits made during review cause an abort without overwriting or creating files", async (t) => {
  const { root, files } = await project(t);
  const { io } = dialogue({}, async (key) => {
    if (key === "confirmRules") await fs.writeFile(path.join(root, "AGENTS.md"), "Concurrent edit\n");
  });
  await assert.rejects(run(["--target", root], io), /changed during setup/);
  assert.equal(await fs.readFile(path.join(root, "AGENTS.md"), "utf8"), "Concurrent edit\n");
  assert.equal(await fs.readFile(path.join(root, "CLAUDE.md"), "utf8"), files["CLAUDE.md"]);
  await assert.rejects(fs.access(path.join(root, ".ai-playbook-manifest.json")));
});

test("a concurrent Claude edit aborts before writing the approved AGENTS update", async (t) => {
  const { root, files } = await project(t);
  const { io } = dialogue({}, async (key) => {
    if (key === "confirmRules") await fs.writeFile(path.join(root, "CLAUDE.md"), "Concurrent Claude edit\n");
  });
  await assert.rejects(run(["--target", root], io), /changed during setup/);
  assert.equal(await fs.readFile(path.join(root, "AGENTS.md"), "utf8"), files["AGENTS.md"]);
  assert.equal(await fs.readFile(path.join(root, "CLAUDE.md"), "utf8"), "Concurrent Claude edit\n");
  await assert.rejects(fs.access(path.join(root, ".ai-playbook-manifest.json")));
});

for (const key of ["existingRules", "commands", "git"]) test(`cancelling ${key} preserves installed files and metadata`, async (t) => {
  const { root, files } = await project(t);
  assert.equal(await run(["--target", root, "--yes"], dialogue().io), 0);
  const manifestPath = path.join(root, ".ai-playbook-manifest.json");
  const manifest = await fs.readFile(manifestPath, "utf8");
  assert.equal(await run(["--target", root], dialogue({ [key]: null }).io), 1);
  assert.equal(await fs.readFile(manifestPath, "utf8"), manifest);
  for (const [name, text] of Object.entries(files)) assert.equal(await fs.readFile(path.join(root, name), "utf8"), text);
});

test("headless review requires yes rather than silently skipping the conversation", async (t) => {
  const { root, files } = await project(t);
  const { io, output } = dialogue();
  delete io.ask;
  io.stdin = { isTTY: false };
  assert.equal(await run(["--target", root], io), 1);
  assert.match(output.text, /interactive terminal/);
  assert.match(output.text, /--yes/);
  await assert.rejects(fs.access(path.join(root, ".ai-playbook-manifest.json")));
  for (const [name, text] of Object.entries(files)) assert.equal(await fs.readFile(path.join(root, name), "utf8"), text);
});

test("reserved marker answers fail before writing any approved changes", async (t) => {
  const { root, files } = await project(t);
  const { io } = dialogue({ rules: "<!-- ai-playbook:review:git:end -->" });
  await assert.rejects(run(["--target", root], io), /reserved review markers/);
  for (const [name, text] of Object.entries(files)) assert.equal(await fs.readFile(path.join(root, name), "utf8"), text);
  await assert.rejects(fs.access(path.join(root, ".ai-playbook-manifest.json")));
});

test("malformed policy sections are rejected rather than overwriting custom text", async (t) => {
  const { root } = await project(t);
  const text = "# Rules\n<!-- ai-playbook:review:git:start -->\nKeep this.\n";
  await fs.writeFile(path.join(root, "AGENTS.md"), text);
  await assert.rejects(run(["--target", root], dialogue().io), /Malformed git review section/);
  assert.equal(await fs.readFile(path.join(root, "AGENTS.md"), "utf8"), text);
});

test("review of legacy Claude rules creates AGENTS with the same confirmed policies", async (t) => {
  const { root, files } = await project(t);
  await fs.unlink(path.join(root, "AGENTS.md"));
  assert.equal(await run(["--target", root], dialogue().io), 0);
  const agents = await fs.readFile(path.join(root, "AGENTS.md"), "utf8");
  assert.ok(agents.startsWith(files["CLAUDE.md"]));
  assert.equal(agents, await fs.readFile(path.join(root, "CLAUDE.md"), "utf8"));
  assert.match(agents, /pytest -q/);
});

test("yes and dry-run never prompt or rewrite existing guidance", async (t) => {
  for (const flag of ["--yes", "--dry-run"]) {
    const { root, files } = await project(t);
    const { io } = dialogue({}, () => assert.fail("Noninteractive review"));
    assert.equal(await run(["--target", root, flag], io), 0);
    for (const [name, text] of Object.entries(files)) assert.equal(await fs.readFile(path.join(root, name), "utf8"), text);
  }
});
