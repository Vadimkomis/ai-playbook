const fs = require("node:fs/promises");
const path = require("node:path");
const { EXTRAS } = require("./catalog");

const MANIFEST = ".ai-playbook-manifest.json";
async function readOptional(file) {
  try { return await fs.readFile(file, "utf8"); }
  catch (error) { if (error.code === "ENOENT") return null; throw error; }
}

function safeRelative(name) {
  if (typeof name !== "string") throw new Error("Invalid manifest path");
  const normalized = name.replaceAll("\\", "/");
  if (!normalized || /[:\0]/.test(normalized) || normalized.split("/").some((part) => !part || part === "." || part === "..")) {
    throw new Error(`Unsafe manifest path: ${name}`);
  }
  return normalized;
}

async function safeDestination(root, name) {
  const parts = safeRelative(name).split("/");
  let current = root;
  for (let i = 0; i < parts.length; i += 1) {
    current = path.join(current, parts[i]);
    let stat;
    try { stat = await fs.lstat(current); }
    catch (error) { if (error.code === "ENOENT") continue; throw error; }
    if (stat.isSymbolicLink()) throw new Error(`Refusing symbolic link destination: ${name}`);
    if (i < parts.length - 1 ? !stat.isDirectory() : !stat.isFile()) {
      throw new Error(`Unexpected file type at ${name}`);
    }
  }
  return current;
}

async function readManifest(root) {
  await safeDestination(root, MANIFEST);
  const content = await readOptional(path.join(root, MANIFEST));
  if (content === null) return null;
  let value;
  try { value = JSON.parse(content); }
  catch { throw new Error("Invalid ai-playbook manifest JSON; existing files were preserved."); }
  if (!value || value.tool !== "ai-playbook" || ![2, 3].includes(value.layoutVersion) || !Array.isArray(value.managedPaths)) {
    throw new Error("Invalid or unsupported ai-playbook manifest; existing files were preserved.");
  }
  const integrations = value.layoutVersion === 2
    ? (value.agent === "both" ? ["codex", "claude"] : [value.agent]) : value.integrations;
  const extras = value.layoutVersion === 2 ? [...EXTRAS] : value.extras;
  if (!Array.isArray(integrations) || integrations.some((item) => !["codex", "claude"].includes(item)) ||
      !Array.isArray(extras) || extras.some((item) => !EXTRAS.includes(item))) {
    throw new Error("Invalid ai-playbook manifest selections");
  }
  return { ...value, integrations: [...new Set(integrations)], extras: [...new Set(extras)],
    managedPaths: [...new Set(value.managedPaths.map(safeRelative))] };
}

async function writePlan(root, entries, force, io) {
  // Preflight every path and capture existing contents before the first write.
  const planned = [];
  for (const entry of entries) {
    const file = await safeDestination(root, entry.to);
    const before = await readOptional(file);
    planned.push({ ...entry, file, before, write: before === null || force || entry.to === MANIFEST });
  }
  const changed = [];
  try {
    for (const entry of planned) {
      if (!entry.write) { io.stdout.write(`Keep ${entry.to}\n`); continue; }
      await safeDestination(root, entry.to);
      // Detect an edit made while the questions or preflight were running.
      if (await readOptional(entry.file) !== entry.before) throw new Error(`File changed during setup: ${entry.to}`);
      await fs.mkdir(path.dirname(entry.file), { recursive: true });
      await fs.writeFile(entry.file, entry.content, { flag: entry.before === null ? "wx" : "w" });
      changed.push(entry);
      io.stdout.write(`${entry.before === null ? "Create" : "Update"} ${entry.to}\n`);
    }
  } catch (error) {
    for (const entry of changed.reverse()) {
      if (entry.before === null) await fs.unlink(entry.file);
      else await fs.writeFile(entry.file, entry.before);
    }
    throw error;
  }
}

module.exports = { MANIFEST, readOptional, safeRelative, safeDestination, readManifest, writePlan };
