const test = require("node:test");
const assert = require("node:assert/strict");
const { execFile } = require("node:child_process");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { promisify } = require("node:util");

const ROOT = path.resolve(__dirname, "..");
const EXPECTED_PACKAGE = "@vadimkom/ai-playbook";
const execFileAsync = promisify(execFile);

test("dry-run package build uses the owned npm scope", async (t) => {
  const cache = await fs.mkdtemp(
    path.join(os.tmpdir(), "ai-playbook-package-test-")
  );
  t.after(() => fs.rm(cache, { recursive: true, force: true }));

  const { stdout } = await execFileAsync(
    process.execPath,
    [process.env.npm_execpath, "pack", "--dry-run", "--json", "--cache", cache],
    { cwd: ROOT }
  );
  const [packedArtifact] = JSON.parse(stdout);

  assert.equal(packedArtifact.name, EXPECTED_PACKAGE);
  const files = packedArtifact.files.map((file) => file.path);
  for (const required of ["templates/core/AGENTS.md", "templates/core/ARCHITECTURE.md",
    "templates/core/memory.md", "templates/adapters/CLAUDE.md", "src/setup.js", "SETUP.md", "docs/integrations.md"]) {
    assert.ok(files.includes(required), `Missing published file: ${required}`);
  }
  assert.equal(files.some((file) => file.startsWith("templates/profiles/")), false);
});
