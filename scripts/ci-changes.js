const { execFileSync } = require("node:child_process");
const fs = require("node:fs");

function classifyChanges(files) {
  const humanDocs = /^(?:README|AGENTS|CLAUDE|ARCHITECTURE|features|evals|memory|SETUP|CHANGELOG)\.md$/;
  const docsOnly = (file) => humanDocs.test(file) || file === "LICENSE" ||
    /^docs\/.*\.md$/.test(file) || /^assets\/.*\.(?:png|jpe?g|gif|svg|webp|mp4)$/.test(file);
  return {
    tests: files.some((file) => !docsOnly(file)),
    homebrew: files.some((file) => /^(?:Formula\/|\.github\/workflows\/|scripts\/)/.test(file) ||
      /^tests\/(?:homebrew-install|ci-changes)\.test\.js$/.test(file)),
  };
}

function selectChecks({ cwd = process.cwd(), eventName, baseSha }) {
  const git = (...args) => execFileSync("git", args, { cwd, encoding: "utf8", stdio: "pipe" });
  if (baseSha && !/^[a-f0-9]{40}$/i.test(baseSha)) throw new Error("Invalid base commit");
  if (!["push", "pull_request"].includes(eventName) || !baseSha || /^0+$/.test(baseSha)) {
    git("show", "--format=", "--check", "HEAD");
    return { tests: true, homebrew: true };
  }
  git("diff", "--check", baseSha, "HEAD");
  // Treat renames as deletion + addition so moving code into docs cannot skip tests.
  return classifyChanges(git("diff", "--name-only", "--no-renames", "-z", baseSha, "HEAD")
    .split("\0").filter(Boolean));
}

module.exports = { classifyChanges, selectChecks };

if (require.main === module) {
  try {
    const result = selectChecks({ eventName: process.env.EVENT_NAME, baseSha: process.env.BASE_SHA });
    const output = `tests=${result.tests}\nhomebrew=${result.homebrew}\n`;
    if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, output);
    process.stdout.write(output);
  } catch (error) {
    process.stderr.write(`${error.stdout || ""}${error.stderr || ""}${error.message}\n`);
    process.exitCode = 1;
  }
}
