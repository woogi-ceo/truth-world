import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import { join, relative } from "node:path";
import test from "node:test";

const repoRoot = new URL("../", import.meta.url);

async function exists(path) {
  try {
    await access(new URL(path, repoRoot));
    return true;
  } catch {
    return false;
  }
}

async function listFiles(dirUrl, prefix = "") {
  const entries = await readdir(dirUrl, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const name = prefix ? `${prefix}/${entry.name}` : entry.name;
    if ([".omx", ".codex", "node_modules"].includes(entry.name)) continue;
    if (entry.isDirectory()) {
      files.push(...await listFiles(new URL(`${entry.name}/`, dirUrl), name));
      continue;
    }
    files.push(name);
  }
  return files;
}

test("git ignore rules exclude local secrets, runtime stores, and orchestration state", async () => {
  const gitignore = await readFile(new URL("../.gitignore", import.meta.url), "utf8");

  for (const pattern of [
    ".env",
    ".env.*",
    "!.env.example",
    "data/auth-store*.json",
    ".omx/",
    ".codex/",
    "node_modules/",
    "*.png"
  ]) {
    assert.match(gitignore, new RegExp(`(^|\\n)${pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}($|\\n)`));
  }
});

test("runtime auth stores are not present as publishable files", async () => {
  assert.equal(await exists("data/auth-store.json"), false);
  assert.equal(await exists("data/auth-store.dev.json"), false);
  assert.equal(await exists("data/.gitkeep"), true);
});

test("public documentation does not contain machine-local absolute paths", async () => {
  const publishableFiles = (await listFiles(repoRoot))
    .filter((file) => /\.(md|json|js|html|css|svg|example|gitignore)$/i.test(file))
    .filter((file) => !file.startsWith("test/"));

  for (const file of publishableFiles) {
    const text = await readFile(new URL(file, repoRoot), "utf8");
    assert.doesNotMatch(text, /\/Users\/woogi\//, `${relative(".", file)} contains a local machine path`);
    assert.doesNotMatch(text, /generated_images\//, `${relative(".", file)} contains generated local image path`);
  }
});

test("GitHub release documents and templates are present", async () => {
  for (const path of [
    "SECURITY.md",
    "docs/ARCHITECTURE.md",
    "docs/SECURITY_MODEL.md",
    "docs/PROVIDER_CONTRACTS.md",
    "docs/OPERATOR_GUIDE.md",
    "docs/GITHUB_RELEASE_CHECKLIST.md",
    "docs/PUBLIC_READINESS_REVIEW.md",
    ".github/PULL_REQUEST_TEMPLATE.md",
    ".github/ISSUE_TEMPLATE/bug_report.md",
    ".github/ISSUE_TEMPLATE/security_hardening.md"
  ]) {
    assert.equal(await exists(path), true, `${path} should exist`);
  }
});
