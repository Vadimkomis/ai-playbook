const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");

// Homebrew and process-group termination are Unix-only.
const unixTest = process.platform === "win32" ? test.skip : test;

async function fixture(t, behavior) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "homebrew-check-"));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const brew = path.join(root, "brew");
  await fs.writeFile(brew, `#!${process.execPath}\n${behavior}\n`, { mode: 0o755 });
  return { brew, logPath: path.join(root, "install.log"), timeoutMs: 2000 };
}

unixTest("successful install enables metadata updates despite inherited overrides", async (t) => {
  const options = await fixture(t, `
    if (process.env.HOMEBREW_NO_AUTO_UPDATE || process.env.HOMEBREW_NO_INSTALL_FROM_API)
      process.exit(9);
    if (process.argv[2] === 'install' &&
        (process.env.HOMEBREW_AUTO_UPDATE_SECS !== '0' ||
         process.env.HOMEBREW_API_AUTO_UPDATE_SECS !== '0')) process.exit(8);
    console.log(process.argv.slice(2).join(' '));
  `);
  const { verifyInstallation } = require("../scripts/verify-homebrew.js");
  await verifyInstallation({ ...options, env: {
    ...process.env, HOMEBREW_NO_AUTO_UPDATE: "1", HOMEBREW_NO_INSTALL_FROM_API: "1",
  } });
  const log = await fs.readFile(options.logPath, "utf8");
  assert.match(log, /update/);
  assert.match(log, /tap ai-playbook-test\/tap/);
  assert.match(log, /install ai-playbook-test\/tap\/ai-playbook/);
  assert.match(log, /test ai-playbook-test\/tap\/ai-playbook/);
  assert.match(log, /style ai-playbook-test\/tap\/ai-playbook/);
});

unixTest("metadata update failure blocks an install that could otherwise succeed", async (t) => {
  const options = await fixture(t, `
    console.log('CALLED ' + process.argv[2]);
    if (process.argv[2] === 'update') {
      console.error('Failed to download metadata');
      process.exit(1);
    }
  `);
  const { verifyInstallation } = require("../scripts/verify-homebrew.js");
  await assert.rejects(verifyInstallation(options), /update.*exited with code 1/);
  const log = await fs.readFile(options.logPath, "utf8");
  assert.match(log, /Failed to download metadata/);
  assert.equal((log.match(/CALLED update/g) || []).length, 1);
  assert.doesNotMatch(log, /CALLED install|CALLED test|CALLED style/);
});

unixTest("download failure stops installation without retrying and retains stderr", async (t) => {
  const options = await fixture(t, `
    console.log('CALLED ' + process.argv[2]);
    if (process.argv[2] === 'install') {
      console.error('Failed to download packages.arm64_golden_gate.jws.json');
      process.exit(22);
    }
  `);
  const { verifyInstallation } = require("../scripts/verify-homebrew.js");
  await assert.rejects(verifyInstallation(options), /install.*exited with code 22/);
  const log = await fs.readFile(options.logPath, "utf8");
  assert.match(log, /Failed to download packages/);
  assert.equal((log.match(/CALLED install/g) || []).length, 1);
  assert.doesNotMatch(log, /CALLED test|CALLED style/);
});

unixTest("stalled install kills descendants and retains progress before the deadline", async (t) => {
  const marker = path.join(os.tmpdir(), `homebrew-child-${process.pid}-${Date.now()}`);
  t.after(() => fs.rm(marker, { force: true }));
  const childCode = `setTimeout(() => require('node:fs').writeFileSync(${JSON.stringify(marker)}, 'alive'), 1800)`;
  const options = await fixture(t, `
    if (process.argv[2] === 'install') {
      require('node:child_process').spawn(process.execPath, ['-e', ${JSON.stringify(childCode)}]);
      console.log('Downloading metadata');
      setInterval(() => {}, 100);
    }
  `);
  const { verifyInstallation } = require("../scripts/verify-homebrew.js");
  const started = Date.now();
  await assert.rejects(verifyInstallation({ ...options, timeoutMs: 700 }), /timed out/);
  assert.ok(Date.now() - started < 5000, "check must not hang");
  assert.match(await fs.readFile(options.logPath, "utf8"), /Downloading metadata/);
  await new Promise((resolve) => setTimeout(resolve, 2000));
  await assert.rejects(fs.access(marker), { code: "ENOENT" });
});

unixTest("missing brew executable fails promptly and records the error", async (t) => {
  const options = await fixture(t, "");
  await fs.unlink(options.brew);
  const { verifyInstallation } = require("../scripts/verify-homebrew.js");
  await assert.rejects(verifyInstallation(options), /ENOENT/);
  assert.match(await fs.readFile(options.logPath, "utf8"), /ENOENT/);
});
