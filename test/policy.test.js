import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("package has no crawler-oriented dependencies", async () => {
  const pkg = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
  const dependencies = {
    ...pkg.dependencies,
    ...pkg.devDependencies
  };
  const names = Object.keys(dependencies);

  assert.deepEqual(names, []);
});

test("browser app calls only local APIs and never exposes provider secrets", async () => {
  const app = await readFile(new URL("../public/app.js", import.meta.url), "utf8");

  assert.match(app, /fetch\("\/api\/feed"\)/);
  assert.match(app, /fetch\("\/api\/summarize"/);
  assert.match(app, /fetch\("\/api\/translate"/);
  assert.doesNotMatch(app, /\/data\/posts\.json/);
  assert.doesNotMatch(app, /truthsocial\.com\/api/i);
  assert.doesNotMatch(app, /api\.x\.ai/i);
  assert.doesNotMatch(app, /XAI_API_KEY/);
  assert.doesNotMatch(app, /TRUTH_SOCIAL_PARTNER_API_KEY/);
});

test("browser provider status uses live provider payload instead of readiness configuration", async () => {
  const app = await readFile(new URL("../public/app.js", import.meta.url), "utf8");
  const providerStatusFunction = app.match(/function providerStatusCopy\(\) \{[\s\S]*?\n\}/)?.[0] || "";

  assert.match(providerStatusFunction, /state\.provider/);
  assert.match(providerStatusFunction, /provider\.live/);
  assert.match(providerStatusFunction, /partner_feed_fallback/);
  assert.doesNotMatch(providerStatusFunction, /readiness\?\.providers\?\.truthPartner\?\.configured/);
});

test("server exposes translation through the local API only", async () => {
  const server = await readFile(new URL("../server.js", import.meta.url), "utf8");

  assert.match(server, /\/api\/translate/);
  assert.match(server, /\/api\/feed/);
  assert.match(server, /\/api\/readiness/);
  assert.match(server, /translateWithGrok/);
  assert.doesNotMatch(server, /truthsocial\.com\/api/i);
});

test("provider modules do not hardcode unofficial Truth Social API endpoints", async () => {
  const provider = await readFile(new URL("../src/truth-partner.js", import.meta.url), "utf8");

  assert.doesNotMatch(provider, /truthsocial\.com\/api/i);
  assert.doesNotMatch(provider, /\/api\/v1\/statuses/i);
});
