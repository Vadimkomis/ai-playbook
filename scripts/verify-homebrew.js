const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");

function runPhase(brew, args, env, timeoutMs, logPath) {
  const record = (data) => {
    fs.appendFileSync(logPath, data);
    process.stdout.write(data);
  };
  record(`\n$ ${brew} ${args.join(" ")}\n`);
  return new Promise((resolve, reject) => {
    const child = spawn(brew, args, { env, detached: true, stdio: ["ignore", "pipe", "pipe"] });
    let failure;
    const stop = (message) => {
      failure = new Error(message);
      record(`${message}\n`);
      try { process.kill(-child.pid, "SIGKILL"); }
      catch (error) { if (error.code !== "ESRCH") record(`${error.message}\n`); }
    };
    const cancel = () => stop(`${args[0]} cancelled`);
    process.once("SIGTERM", cancel);
    process.once("SIGINT", cancel);
    const timer = setTimeout(() => stop(`${args[0]} timed out after ${timeoutMs}ms`), timeoutMs);
    child.stdout.on("data", record);
    child.stderr.on("data", record);
    child.on("error", (error) => {
      failure = error;
      record(`${error.message}\n`);
    });
    child.on("close", (code, signal) => {
      clearTimeout(timer);
      process.removeListener("SIGTERM", cancel);
      process.removeListener("SIGINT", cancel);
      if (!failure && code !== 0) {
        failure = new Error(`${args[0]} exited with ${signal ? `signal ${signal}` : `code ${code}`}`);
        record(`${failure.message}\n`);
      }
      if (failure) reject(failure);
      else resolve();
    });
  });
}

async function verifyInstallation({
  brew = "brew", logPath = path.resolve(".tmp/homebrew-install.log"),
  timeoutMs = 600000, env = process.env,
} = {}) {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) throw new Error("Invalid phase timeout");
  fs.mkdirSync(path.dirname(logPath), { recursive: true });
  fs.writeFileSync(logPath, "");
  const brewEnv = { ...env };
  delete brewEnv.HOMEBREW_NO_AUTO_UPDATE;
  delete brewEnv.HOMEBREW_NO_INSTALL_FROM_API;
  const formula = "ai-playbook-test/tap/ai-playbook";
  const phases = [
    ["update"],
    ["tap", "ai-playbook-test/tap", path.resolve(__dirname, "..")],
    ["install", formula], ["test", formula], ["style", formula],
  ];
  for (const args of phases) {
    const phaseEnv = args[0] === "install" ? {
      ...brewEnv, HOMEBREW_AUTO_UPDATE_SECS: "0", HOMEBREW_API_AUTO_UPDATE_SECS: "0",
    } : brewEnv;
    await runPhase(brew, args, phaseEnv, timeoutMs, logPath);
  }
}

module.exports = { verifyInstallation };

if (require.main === module) {
  verifyInstallation().catch((error) => {
    console.error(`Homebrew verification failed: ${error.message}. See .tmp/homebrew-install.log`);
    process.exitCode = 1;
  });
}
