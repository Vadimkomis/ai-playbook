const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

test("documentation-only changes avoid the test matrix and Homebrew", () => {
  const { classifyChanges } = require("../scripts/ci-changes");
  assert.deepEqual(classifyChanges(["README.md", "memory.md", "docs/development/review.md", "assets/banner.png"]),
    { tests: false, homebrew: false });
});

for (const file of ["src/cli.js", "templates/core/AGENTS.md", ".agents/skills/mobile-engineer/SKILL.md",
  "contracts/independent-validator/README.md", "Codex/agents/reviewer.toml", "Claude/CLAUDE.md",
  "package.json", "pnpm-lock.yaml", "tests/cli.test.js", "future-language/new-module.rs"]) {
  test(`${file} retains the full test matrix`, () => {
    const { classifyChanges } = require("../scripts/ci-changes");
    assert.deepEqual(classifyChanges(["README.md", file]), { tests: true, homebrew: false });
  });
}

for (const file of ["Formula/ai-playbook.rb", ".github/workflows/test.yml", "scripts/verify-homebrew.js",
  "scripts/ci-changes.js", "tests/homebrew-install.test.js", "tests/ci-changes.test.js"]) {
  test(`${file} retains Homebrew verification and the test matrix`, () => {
    const { classifyChanges } = require("../scripts/ci-changes");
    assert.deepEqual(classifyChanges([file]), { tests: true, homebrew: true });
  });
}

async function repository(t) {
  const cwd = await fs.mkdtemp(path.join(os.tmpdir(), "playbook-ci-"));
  t.after(() => fs.rm(cwd, { recursive: true, force: true }));
  const git = (...args) => execFileSync("git", ["-c", "commit.gpgsign=false", "-c", "core.hooksPath=/dev/null",
    "-c", "user.name=CI Test", "-c", "user.email=ci@example.invalid", ...args], { cwd, stdio: "pipe" }).toString().trim();
  git("init");
  await fs.mkdir(path.join(cwd, "src"));
  await fs.mkdir(path.join(cwd, "docs"));
  await fs.writeFile(path.join(cwd, "README.md"), "# Guide\n");
  await fs.writeFile(path.join(cwd, "src/cli.js"), "module.exports = {};\n");
  const commit = () => { git("add", "."); git("commit", "-m", "Fixture"); return git("rev-parse", "HEAD"); };
  return { cwd, git, commit, base: commit() };
}

test("selection considers the whole PR even when its latest commit only changes docs", async (t) => {
  const { cwd, commit, base } = await repository(t);
  const { selectChecks } = require("../scripts/ci-changes");
  await fs.writeFile(path.join(cwd, "README.md"), "# Updated guide\n");
  const docs = commit();
  assert.deepEqual(selectChecks({ cwd, eventName: "pull_request", baseSha: base }), { tests: false, homebrew: false });
  await fs.writeFile(path.join(cwd, "src/cli.js"), "module.exports = { changed: true };\n");
  commit();
  await fs.writeFile(path.join(cwd, "README.md"), "# Another docs update\n");
  commit();
  assert.deepEqual(selectChecks({ cwd, eventName: "pull_request", baseSha: docs }), { tests: true, homebrew: false });
});

test("moving code into docs still tests the removed source path", async (t) => {
  const { cwd, git, commit, base } = await repository(t);
  git("mv", "src/cli.js", "docs/old-code.md"); commit();
  const { selectChecks } = require("../scripts/ci-changes");
  assert.deepEqual(selectChecks({ cwd, eventName: "push", baseSha: base }), { tests: true, homebrew: false });
});

test("whitespace errors fail the lightweight docs check", async (t) => {
  const { cwd, commit, base } = await repository(t);
  await fs.writeFile(path.join(cwd, "README.md"), "Trailing whitespace  \n"); commit();
  const { selectChecks } = require("../scripts/ci-changes");
  assert.throws(() => selectChecks({ cwd, eventName: "pull_request", baseSha: base }),
    (error) => error.status === 2 && error.stdout.toString().includes("trailing whitespace"));
});

test("manual checks and missing baselines run everything", async (t) => {
  const { cwd, base } = await repository(t);
  const { selectChecks } = require("../scripts/ci-changes");
  for (const [eventName, baseSha] of [["workflow_dispatch", base], ["push", "0".repeat(40)], ["pull_request", ""]]) {
    assert.deepEqual(selectChecks({ cwd, eventName, baseSha }), { tests: true, homebrew: true });
  }
});

test("invalid baselines fail rather than accepting Git options", async (t) => {
  const { cwd } = await repository(t);
  const { selectChecks } = require("../scripts/ci-changes");
  assert.throws(() => selectChecks({ cwd, eventName: "pull_request", baseSha: "--output=wrong" }), /Invalid base commit/);
});

test("an unavailable base commit fails instead of skipping checks", async (t) => {
  const { cwd } = await repository(t);
  const { selectChecks } = require("../scripts/ci-changes");
  assert.throws(() => selectChecks({ cwd, eventName: "pull_request", baseSha: "a".repeat(40) }),
    (error) => error.status === 128);
});
