import { spawn } from "node:child_process";
import { accessSync } from "node:fs";
import { access, mkdtemp, readFile, rm } from "node:fs/promises";
import { constants } from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, join } from "node:path";

import {
  buildTranslationMessages,
  normalizeTranslationPayload,
  normalizeTranslationRequestItems,
  parseModelJson
} from "./grok.js";
import { isProductionEnv } from "./security-policy.js";

export const DEFAULT_CODEX_TRANSLATION_MODEL = "gpt-5.5";
const DEFAULT_CODEX_TIMEOUT_MS = 120_000;

function truthy(value) {
  return /^(1|true|yes|on)$/i.test(String(value || "").trim());
}

function pathCandidates(command, pathValue = process.env.PATH || "") {
  if (command.includes("/")) return [command];
  return String(pathValue || "")
    .split(delimiter)
    .filter(Boolean)
    .map((dir) => join(dir, command));
}

export async function isCodexCliAvailable({ command = "codex", pathValue = process.env.PATH || "" } = {}) {
  for (const candidate of pathCandidates(command, pathValue)) {
    try {
      await access(candidate, constants.X_OK);
      return true;
    } catch {
      // Keep scanning PATH.
    }
  }
  return false;
}

export function isCodexCliAvailableSync({ command = "codex", pathValue = process.env.PATH || "" } = {}) {
  for (const candidate of pathCandidates(command, pathValue)) {
    try {
      accessSync(candidate, constants.X_OK);
      return true;
    } catch {
      // Keep scanning PATH.
    }
  }
  return false;
}

export function codexCliEnabled(env = process.env) {
  if (truthy(env.CODEX_TRANSLATION_DISABLED)) return false;
  if (String(env.CODEX_TRANSLATION_PROVIDER || "auto").trim().toLowerCase() === "disabled") return false;
  if (isProductionEnv(env) && !truthy(env.TRUTH_WORLD_ALLOW_CODEX_TRANSLATION_IN_PRODUCTION)) return false;
  return true;
}

export function buildCodexChildEnv(env = process.env) {
  const allowed = ["PATH", "HOME", "USER", "LOGNAME", "LANG", "LC_ALL", "SHELL", "TERM", "CODEX_HOME"];
  const childEnv = { NO_COLOR: "1" };
  allowed.forEach((name) => {
    if (env[name]) childEnv[name] = env[name];
  });
  return childEnv;
}

export function buildCodexTranslationPrompt({ targetLanguage, items }) {
  const messages = buildTranslationMessages({ targetLanguage, items });
  return [
    "You are Truth World's server-side translation engine.",
    "Do not use tools, browse, edit files, run shell commands, or add commentary.",
    "Return only the requested JSON object. No markdown fences.",
    "",
    "System translation rules:",
    messages[0].content,
    "",
    "User payload:",
    messages[1].content
  ].join("\n");
}

function collectOutput(stream, limit = 64_000) {
  let output = "";
  stream.on("data", (chunk) => {
    output += chunk.toString("utf8");
    if (output.length > limit) output = output.slice(-limit);
  });
  return () => output;
}

export async function runCodexExec(prompt, {
  command = process.env.CODEX_TRANSLATION_COMMAND || "codex",
  model = process.env.CODEX_TRANSLATION_MODEL || DEFAULT_CODEX_TRANSLATION_MODEL,
  timeoutMs = Number(process.env.CODEX_TRANSLATION_TIMEOUT_MS || DEFAULT_CODEX_TIMEOUT_MS)
} = {}) {
  const tmpRoot = await mkdtemp(join(tmpdir(), "truth-world-codex-"));
  const outputPath = join(tmpRoot, "translation.json");

  try {
    const args = [
      "exec",
      "--skip-git-repo-check",
      "--ephemeral",
      "--sandbox",
      "read-only",
      "--ignore-rules",
      "-m",
      model,
      "-o",
      outputPath,
      "-"
    ];

    const child = spawn(command, args, {
      stdio: ["pipe", "pipe", "pipe"],
      cwd: tmpRoot,
      env: buildCodexChildEnv(process.env)
    });

    const stdout = collectOutput(child.stdout);
    const stderr = collectOutput(child.stderr);
    child.stdin.end(prompt);

    const exitCode = await new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        child.kill("SIGTERM");
        const err = new Error(`Codex translation timed out after ${timeoutMs}ms.`);
        err.code = "CODEX_TRANSLATION_TIMEOUT";
        err.status = 504;
        reject(err);
      }, timeoutMs);

      child.on("error", (error) => {
        clearTimeout(timer);
        reject(error);
      });

      child.on("close", (code) => {
        clearTimeout(timer);
        resolve(code);
      });
    });

    if (exitCode !== 0) {
      const err = new Error(`Codex CLI exited with ${exitCode}: ${stderr() || stdout()}`);
      err.code = "CODEX_TRANSLATION_FAILED";
      err.status = 502;
      err.publicMessage = "Codex could not translate this screen right now.";
      throw err;
    }

    return await readFile(outputPath, "utf8");
  } finally {
    await rm(tmpRoot, { recursive: true, force: true });
  }
}

export async function translateWithCodex({
  targetLanguage,
  items,
  runCodex = runCodexExec,
  model = process.env.CODEX_TRANSLATION_MODEL || DEFAULT_CODEX_TRANSLATION_MODEL
}) {
  const normalizedItems = normalizeTranslationRequestItems(items);
  const prompt = buildCodexTranslationPrompt({ targetLanguage, items: normalizedItems });
  const content = await runCodex(prompt, { model });
  const parsed = parseModelJson(content);
  return normalizeTranslationPayload(parsed, normalizedItems, `codex:${model}`);
}
