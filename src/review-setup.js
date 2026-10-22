const { terminalPrompt, policyQuestions, askFields, commandBlock, isThinAdapter } = require("./prompts");

function policyBodies(answers) {
  return {
    commands: answers.commands && `## Confirmed checks\n\nUse these commands instead of earlier check commands:\n\n${commandBlock(answers.commands)}`,
    safeguards: answers.safeguards && `## Confirmed safeguards\n\nPreserve the following; other existing safeguards still apply:\n\n${answers.safeguards}`,
    review: answers.review && `## Confirmed review policy\n\nThis replaces earlier review requirements:\n\n${answers.review}`,
    git: answers.git && `## Confirmed Git policy\n\nThis replaces earlier commit and push instructions:\n\n${answers.git}`,
    rules: answers.rules && `## Confirmed additional rules\n\n${answers.rules}`,
  };
}

function replacePolicy(content, key, body) {
  if (body.includes("<!-- ai-playbook:review:")) throw new Error("Policy answers cannot contain reserved review markers");
  const start = `<!-- ai-playbook:review:${key}:start -->`;
  const end = `<!-- ai-playbook:review:${key}:end -->`;
  const starts = content.split(start).length - 1;
  const ends = content.split(end).length - 1;
  const block = `${start}\n${body}\n${end}`;
  if (!starts && !ends) return `${content}${content.endsWith("\n") ? "\n" : "\n\n"}${block}\n`;
  const pattern = new RegExp(`^${start}\\r?\\n[\\s\\S]*?^${end}\\r?$`, "m");
  if (starts !== 1 || ends !== 1 || !pattern.test(content)) {
    throw new Error(`Malformed ${key} review section; repair it before reviewing rules`);
  }
  return content.replace(pattern, () => block);
}

function draftEntries(existing, bodies) {
  const entries = [];
  for (const to of ["AGENTS.md", "CLAUDE.md"]) {
    const before = existing[to];
    if (before === null || to === "CLAUDE.md" && isThinAdapter(before)) continue;
    let content = before;
    for (const [key, body] of Object.entries(bodies)) {
      if (body) content = replacePolicy(content, key, body);
    }
    if (bodies.commands) content = content.replace("<!-- ai-playbook:setup-pending -->", "");
    if (content !== before) entries.push({ to, content, expected: before, replace: true });
  }
  return entries;
}

function preview(entry, io) {
  const before = entry.expected.split("\n");
  const after = entry.content.split("\n");
  let first = 0;
  while (first < before.length && first < after.length && before[first] === after[first]) first++;
  while (before.length > first && after.length > first && before.at(-1) === after.at(-1)) {
    before.pop(); after.pop();
  }
  const visible = (line) => !line.startsWith("<!-- ai-playbook:review:");
  io.stdout.write(`\nProposed changes to ${entry.to}:\n`);
  for (const line of before.slice(first).filter(visible)) io.stdout.write(`- ${line}\n`);
  for (const line of after.slice(first).filter(visible)) io.stdout.write(`+ ${line}\n`);
}

async function reviewExisting(existing, args, io) {
  const hasRules = existing["AGENTS.md"] !== null ||
    existing["CLAUDE.md"] !== null && !isThinAdapter(existing["CLAUDE.md"]);
  if (!hasRules || args.force || args.yes || args.dryRun) return [];
  const prompt = terminalPrompt(io);
  if (!prompt) {
    io.stderr.write("Reviewing existing rules needs an interactive terminal. Run ai-playbook there, or use --yes to keep existing guidance without review.\n");
    return null;
  }
  try {
    const choice = await askFields([["existingRules", "Existing project instructions found: 1) keep current rules  2) review rules", "1",
      { "1": "keep", "2": "review" }]], prompt, io);
    if (!choice) return null;
    if (choice.existingRules === "keep") return [];
    io.stdout.write("Review current instructions in AGENTS.md / CLAUDE.md. Blank answers keep existing policies; other instructions stay unchanged.\n");
    const answers = await askFields(policyQuestions({}, true), prompt, io);
    if (!answers) return null;
    const entries = draftEntries(existing, policyBodies(answers));
    if (!entries.length) { io.stdout.write("No policy changes requested.\n"); return []; }
    for (const entry of entries) preview(entry, io);
    const confirmed = await askFields([["confirmRules", "Save these changes? (yes/no)", "no",
      { yes: true, y: true, no: false, n: false }]], prompt, io);
    if (!confirmed || !confirmed.confirmRules) {
      if (confirmed) io.stdout.write("Changes declined; no files changed.\n");
      return null;
    }
    return entries;
  } finally { prompt.close(); }
}

module.exports = { reviewExisting };
