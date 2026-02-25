const test = require("node:test");
const assert = require("node:assert/strict");
const { detectProfilesFromProject, parseArgs } = require("../src/cli");

test("parseArgs parses init arguments", () => {
  const parsed = parseArgs([
    "init",
    "--profile",
    "mobile-ios",
    "--profile",
    "backend-rust",
    "--agent",
    "both",
    "--force",
    "--dry-run",
    "--target",
    "/tmp/example"
  ]);

  assert.equal(parsed.command, "init");
  assert.deepEqual(parsed.profiles, ["mobile-ios", "backend-rust"]);
  assert.equal(parsed.agent, "both");
  assert.equal(parsed.force, true);
  assert.equal(parsed.dryRun, true);
  assert.equal(parsed.target, "/tmp/example");
});

test("detectProfilesFromProject detects stack signals", () => {
  const profiles = detectProfilesFromProject(
    ["Cargo.toml", "pyproject.toml", "settings.gradle.kts", "Package.swift"],
    { dependencies: { react: "^19.0.0" } }
  );

  assert.deepEqual(
    profiles.sort(),
    ["backend-python", "backend-rust", "frontend-react", "mobile-android", "mobile-ios"].sort()
  );
});
