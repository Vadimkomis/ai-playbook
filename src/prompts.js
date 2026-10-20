const readline = require("node:readline");

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

function commandBlock(commands) {
  const longest = Math.max(2, ...(commands.match(/`+/g) || []).map((item) => item.length));
  const fence = "`".repeat(longest + 1);
  return `${fence}text\n${commands}\n${fence}`;
}

function policyQuestions(proposed = {}, keep = false) {
  const suffix = keep ? " (Enter to keep existing)" : "";
  return [
    ["commands", `Which commands check changes? (tests, lint, build)${suffix}`, keep ? "" : proposed.commands],
    ["safeguards", `What behavior or data must changes preserve?${suffix}`,
      keep ? "" : "Existing behavior, stored data and public interfaces."],
    ["review", `Review: ${keep ? "0) keep existing  " : ""}1) self-review  2) independent for substantial changes  3) independent for every change`,
      keep ? "0" : "2", keep ? { "0": "", ...REVIEWS } : REVIEWS],
    ["git", `After checks and review: ${keep ? "0) keep existing  " : ""}1) leave changes for review  2) commit  3) commit and push`,
      keep ? "0" : "1", keep ? { "0": "", ...GIT } : GIT],
    ["rules", `Any other rules? (screenshots, evaluation criteria, dependencies; Enter to ${keep ? "keep existing" : "skip"})`, ""],
  ];
}

async function askFields(fields, prompt, io) {
  const answers = {};
  for (const [key, label, defaultValue = "", choices] of fields) {
    let answer;
    do {
      answer = prompt ? await prompt.ask(key, label, defaultValue) : "";
      if (answer === null || answer === undefined) {
        io.stdout.write("Setup cancelled; no files changed.\n"); return null;
      }
      answer = String(answer).trim() || defaultValue;
      if (choices && !Object.hasOwn(choices, answer)) {
        io.stdout.write(`Choose ${Object.keys(choices).join(", ")}.\n`);
      }
    } while (choices && !Object.hasOwn(choices, answer));
    answers[key] = choices ? choices[answer] : answer;
  }
  return answers;
}

function isThinAdapter(content) {
  return content !== null && /^\s*(?:#.*\n\s*)?@AGENTS\.md\s*$/.test(content);
}

module.exports = { REVIEWS, GIT, terminalPrompt, policyQuestions, askFields, commandBlock, isThinAdapter };
