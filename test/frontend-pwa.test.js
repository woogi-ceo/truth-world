import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("HTML advertises mobile app and PWA metadata", async () => {
  const html = await readFile(new URL("../public/index.html", import.meta.url), "utf8");

  assert.match(html, /viewport-fit=cover/);
  assert.match(html, /<link rel="manifest" href="\/manifest\.webmanifest">/);
  assert.match(html, /apple-mobile-web-app-capable/);
  assert.match(html, /apple-touch-icon/);
  assert.match(html, /meta name="theme-color"/);
  assert.match(html, /href="\/styles\.css\?v=responsive-polish-2"/);
  assert.match(html, /src="\/app\.js\?v=pwa-1"/);
  assert.match(html, /aria-current="page"/);
});

test("web app manifest is installable and section-aware", async () => {
  const manifest = JSON.parse(await readFile(new URL("../public/manifest.webmanifest", import.meta.url), "utf8"));

  assert.equal(manifest.name, "Truth World");
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.start_url, "/");
  assert.equal(manifest.scope, "/");
  assert.equal(manifest.theme_color, "#ffffff");
  assert.ok(manifest.icons.length >= 3);
  assert.deepEqual(
    manifest.shortcuts.map((shortcut) => shortcut.url),
    ["/?section=truth", "/?section=topics", "/?section=news"]
  );
});

test("service worker caches app shell but not public API responses", async () => {
  const sw = await readFile(new URL("../public/sw.js", import.meta.url), "utf8");

  assert.match(sw, /truth-world-shell-v5/);
  assert.match(sw, /\/offline\.html/);
  assert.match(sw, /url\.pathname\.startsWith\("\/api\/"\)/);
  assert.match(sw, /event\.respondWith\(fetch\(request\)\)/);
  const shellAssets = sw.match(/const SHELL_ASSETS = \[([\s\S]*?)\];/)?.[1] || "";
  assert.doesNotMatch(shellAssets, /\/api\//);
});

test("browser registers the service worker as progressive enhancement", async () => {
  const app = await readFile(new URL("../public/app.js", import.meta.url), "utf8");

  assert.match(app, /"serviceWorker" in navigator/);
  assert.match(app, /navigator\.serviceWorker\.register\("\/sw\.js"\)/);
  assert.match(app, /function sectionFromUrl\(\)/);
  assert.match(app, /aria-current/);
});

test("tablet layout keeps compact desktop rails until the phone breakpoint", async () => {
  const css = await readFile(new URL("../public/styles.css", import.meta.url), "utf8");
  const tabletBlock = css.match(/@media \(max-width: 1180px\) \{([\s\S]*?)@media \(max-width: 620px\)/)?.[1] || "";
  const phoneBlock = css.match(/@media \(max-width: 620px\) \{([\s\S]*?)@media \(max-width: 620px\)/)?.[1] || "";

  assert.match(tabletBlock, /grid-template-columns: 76px minmax\(0, 1fr\) clamp\(260px, 30vw, 340px\);/);
  assert.match(tabletBlock, /\.wordmark-mark\s*\{[\s\S]*display: block;/);
  assert.doesNotMatch(tabletBlock, /\.nav-list\s*\{[\s\S]*position: fixed;/);
  assert.doesNotMatch(css, /@media \(max-width: 960px\)/);

  assert.match(phoneBlock, /\.social-shell\s*\{[\s\S]*display: block;/);
  assert.match(phoneBlock, /\.left-sidebar\s*\{[\s\S]*height: 0;/);
  assert.match(phoneBlock, /\.sidebar-secondary\s*\{[\s\S]*display: none;/);
  assert.match(phoneBlock, /\.wordmark,\s*[\s\S]*\.sidebar-policy\s*\{[\s\S]*display: none;/);
  assert.match(phoneBlock, /\.nav-list\s*\{[\s\S]*position: fixed;/);
  assert.match(phoneBlock, /\.mobile-action-dock\s*\{[\s\S]*position: fixed;/);
  assert.match(phoneBlock, /\.brief-controls \.language-control span\s*\{[\s\S]*clip-path: inset\(50%\);/);
});

test("server serves web app manifest with manifest content type", async () => {
  const server = await readFile(new URL("../server.js", import.meta.url), "utf8");

  assert.match(server, /"\.webmanifest": "application\/manifest\+json; charset=utf-8"/);
});
