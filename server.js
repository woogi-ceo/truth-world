import { createReadStream } from "node:fs";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

import { codexCliEnabled, isCodexCliAvailable, translateWithCodex } from "./src/codex-cli.js";
import { summarizeWithGrok, translateWithGrok } from "./src/grok.js";
import { createQuotaRegistry, enforceQuota } from "./src/rate-limit.js";
import { buildReadinessStatus } from "./src/readiness.js";
import {
  isLocalClient,
  isProductionEnv,
  isSecureRequest,
  requireSecureAuthTransport,
  shouldUseSecureCookies
} from "./src/security-policy.js";
import { fetchTruthPartnerFeed } from "./src/truth-partner.js";
import {
  beginPhoneVerification,
  clearSessionCookieHeader,
  completePhoneVerification,
  getSessionUser,
  login,
  logout,
  parseCookies,
  sessionCookieHeader,
  signup,
  SESSION_COOKIE
} from "./src/auth-store.js";

const rootDir = resolve(fileURLToPath(new URL(".", import.meta.url)));
const publicDir = resolve(rootDir, "public");
const manualSeedPath = resolve(publicDir, "data/posts.json");
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || "127.0.0.1";

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8"
};

function sendJson(res, status, payload) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff"
  });
  res.end(JSON.stringify(payload));
}

function setBaseHeaders(res) {
  res.setHeader("x-content-type-options", "nosniff");
  res.setHeader("referrer-policy", "strict-origin-when-cross-origin");
  res.setHeader("permissions-policy", "geolocation=(), microphone=(), camera=()");
}

function assertSameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) {
    if (isProductionEnv(process.env)) {
      const err = new Error("Production state-changing requests require an Origin header.");
      err.status = 403;
      err.code = "MISSING_ORIGIN";
      throw err;
    }
    return;
  }
  const proto = isSecureRequest(req) ? "https" : "http";
  const expected = `${proto}://${req.headers.host}`;
  if (origin !== expected) {
    const err = new Error("Cross-origin auth requests are not allowed.");
    err.status = 403;
    err.code = "BAD_ORIGIN";
    throw err;
  }
}

function currentSessionToken(req) {
  return parseCookies(req.headers.cookie || "")[SESSION_COOKIE] || "";
}

async function readJsonBody(req) {
  let body = "";
  for await (const chunk of req) {
    body += chunk;
    if (body.length > 128_000) {
      const err = new Error("Request body is too large.");
      err.status = 413;
      throw err;
    }
  }

  try {
    return JSON.parse(body || "{}");
  } catch {
    const err = new Error("Request body must be valid JSON.");
    err.status = 400;
    throw err;
  }
}

async function loadManualSeed() {
  return JSON.parse(await readFile(manualSeedPath, "utf8"));
}

function withReadiness(payload, readiness, providerOverrides = {}) {
  return {
    ...payload,
    readiness,
    provider: {
      sourceProvider: readiness.sourceProvider,
      live: readiness.sourceProvider === "truth_partner_api",
      ...(payload.provider || {}),
      ...providerOverrides
    }
  };
}

function sendError(res, error, fallbackCode, fallbackMessage) {
  if (error.retryAfterSeconds) {
    res.setHeader("Retry-After", String(error.retryAfterSeconds));
  }
  sendJson(res, error.status || 500, {
    error: {
      code: error.code || fallbackCode,
      message: error.publicMessage || error.message || fallbackMessage
    }
  });
}

async function handleSummarize(req, res, quotas) {
  try {
    enforceQuota(quotas.ai, req, "ai:summarize");
    const input = await readJsonBody(req);
    const result = await summarizeWithGrok(input);
    sendJson(res, 200, result);
  } catch (error) {
    sendError(res, error, "SUMMARY_FAILED", "Unable to summarize content.");
  }
}

async function handleFeed(req, res, quotas) {
  try {
    enforceQuota(quotas.feed, req, "feed");
  } catch (error) {
    sendError(res, error, "FEED_RATE_LIMITED", "Too many feed requests.");
    return;
  }

  const readiness = buildReadinessStatus();
  const manualSeed = await loadManualSeed();

  if (!readiness.providers.truthPartner.configured) {
    sendJson(res, 200, withReadiness(manualSeed, readiness, {
      sourceProvider: "manual_seed",
      live: false,
      status: "waiting_for_truth_partner_credentials"
    }));
    return;
  }

  try {
    const partnerPayload = await fetchTruthPartnerFeed({ manualSeed });
    sendJson(res, 200, withReadiness(partnerPayload, readiness));
  } catch (error) {
    if (error.status === 429) {
      sendError(res, error, "FEED_RATE_LIMITED", "Too many feed requests.");
      return;
    }
    sendJson(res, 200, withReadiness(manualSeed, readiness, {
      sourceProvider: "manual_seed",
      live: false,
      status: "partner_feed_fallback",
      fallbackReason: error.code || "TRUTH_PARTNER_REQUEST_FAILED"
    }));
  }
}

async function translateWithConfiguredProvider(input, req) {
  if (process.env.XAI_API_KEY) {
    return translateWithGrok(input);
  }

  if (isProductionEnv(process.env) && process.env.TRUTH_WORLD_ALLOW_CODEX_TRANSLATION_IN_PRODUCTION !== "1") {
    const err = new Error("Codex translation fallback is disabled in production.");
    err.status = 503;
    err.code = "CODEX_FALLBACK_BLOCKED_IN_PRODUCTION";
    throw err;
  }

  if (!isLocalClient(req) && process.env.TRUTH_WORLD_ALLOW_REMOTE_CODEX_TRANSLATION !== "1") {
    const err = new Error("Codex translation fallback is limited to local development hosts.");
    err.status = 503;
    err.code = "CODEX_FALLBACK_LOCAL_ONLY";
    throw err;
  }

  const codexAvailable = codexCliEnabled(process.env)
    && await isCodexCliAvailable({ command: process.env.CODEX_TRANSLATION_COMMAND || "codex" });
  if (codexAvailable) {
    return translateWithCodex(input);
  }

  return translateWithGrok(input);
}

async function handleTranslate(req, res, quotas) {
  try {
    enforceQuota(quotas.ai, req, "ai:translate");
    const input = await readJsonBody(req);
    const result = await translateWithConfiguredProvider(input, req);
    sendJson(res, 200, result);
  } catch (error) {
    sendError(res, error, "TRANSLATION_FAILED", "Unable to translate content.");
  }
}

async function currentUserFromRequest(req) {
  return getSessionUser(currentSessionToken(req));
}

function requireAuthenticatedUser(user) {
  if (user) return user;
  const err = new Error("Sign in is required.");
  err.status = 401;
  err.code = "AUTH_REQUIRED";
  throw err;
}

function requireWriteEligibleUser(user) {
  const authenticatedUser = requireAuthenticatedUser(user);
  if (authenticatedUser.writeEligible) return authenticatedUser;
  const err = new Error("Writing requires verified phone and country.");
  err.status = 403;
  err.code = "WRITE_ELIGIBILITY_REQUIRED";
  throw err;
}

async function handleWriteAction(req, res, quotas) {
  try {
    requireSecureAuthTransport(req);
    assertSameOrigin(req);
    enforceQuota(quotas.auth, req, "write:action");
    const user = requireWriteEligibleUser(await currentUserFromRequest(req));
    const payload = await readJsonBody(req);
    sendJson(res, 202, {
      ok: true,
      writeEligible: true,
      user,
      action: String(payload.action || "write.action").slice(0, 80),
      target: String(payload.target || "").slice(0, 160)
    });
  } catch (error) {
    sendError(res, error, "WRITE_ACTION_FAILED", "Write eligibility check failed.");
  }
}

async function handleAuth(req, res, action, quotas) {
  try {
    if (req.method === "GET") {
      enforceQuota(quotas.auth, req, `auth:${action}:read`);
    } else {
      requireSecureAuthTransport(req);
      assertSameOrigin(req);
      enforceQuota(quotas.auth, req, `auth:${action}`);
    }

    if (action === "me") {
      const user = await currentUserFromRequest(req);
      sendJson(res, 200, { authenticated: Boolean(user), user });
      return;
    }

    if (action === "write-eligibility") {
      const user = await currentUserFromRequest(req);
      sendJson(res, 200, {
        authenticated: Boolean(user),
        writeEligible: Boolean(user?.writeEligible),
        user,
        requirement: "verified_phone_and_country"
      });
      return;
    }

    if (action === "phone-start") {
      const user = requireAuthenticatedUser(await currentUserFromRequest(req));
      const result = await beginPhoneVerification(user.id);
      sendJson(res, 200, {
        user: result.user,
        challenge: result.challenge,
        writeEligible: Boolean(result.user?.writeEligible)
      });
      return;
    }

    if (action === "phone-check") {
      const user = requireAuthenticatedUser(await currentUserFromRequest(req));
      const payload = await readJsonBody(req);
      const result = await completePhoneVerification(user.id, payload.code);
      sendJson(res, 200, {
        user: result.user,
        writeEligible: Boolean(result.user?.writeEligible)
      });
      return;
    }

    if (action === "signup") {
      const payload = await readJsonBody(req);
      enforceQuota(quotas.auth, req, "auth:signup:account", {
        keyParts: [payload.email]
      });
      const result = await signup(payload);
      res.setHeader("Set-Cookie", sessionCookieHeader(result.sessionToken, result.expiresAt, {
        secure: shouldUseSecureCookies(req)
      }));
      sendJson(res, 201, { authenticated: true, user: result.user });
      return;
    }

    if (action === "login") {
      const payload = await readJsonBody(req);
      enforceQuota(quotas.auth, req, "auth:login:account", {
        keyParts: [payload.email]
      });
      const result = await login(payload);
      res.setHeader("Set-Cookie", sessionCookieHeader(result.sessionToken, result.expiresAt, {
        secure: shouldUseSecureCookies(req)
      }));
      sendJson(res, 200, { authenticated: true, user: result.user });
      return;
    }

    if (action === "logout") {
      await logout(currentSessionToken(req));
      res.setHeader("Set-Cookie", clearSessionCookieHeader({
        secure: shouldUseSecureCookies(req)
      }));
      sendJson(res, 200, { authenticated: false, user: null });
      return;
    }

    sendJson(res, 404, { error: { code: "AUTH_ROUTE_NOT_FOUND", message: "Auth route not found." } });
  } catch (error) {
    sendError(res, error, "AUTH_FAILED", "Authentication failed.");
  }
}

async function serveStatic(req, res) {
  const url = new URL(req.url, "http://localhost");
  const routePath = url.pathname === "/" ? "/index.html" : url.pathname;
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(routePath);
  } catch {
    sendJson(res, 400, { error: { code: "BAD_PATH", message: "Malformed request path." } });
    return;
  }
  const filePath = resolve(publicDir, `.${decodedPath}`);

  if (!(filePath === publicDir || filePath.startsWith(publicDir + sep))) {
    sendJson(res, 403, { error: { code: "FORBIDDEN", message: "Forbidden path." } });
    return;
  }

  try {
    await readFile(filePath);
  } catch {
    sendJson(res, 404, { error: { code: "NOT_FOUND", message: "File not found." } });
    return;
  }

  setBaseHeaders(res);
  res.writeHead(200, {
    "content-type": mimeTypes[extname(filePath)] || "application/octet-stream",
    "cache-control": "no-store"
  });
  createReadStream(filePath).pipe(res);
}

export function createTruthWorldServer() {
  const quotas = createQuotaRegistry(process.env);

  return createServer(async (req, res) => {
    setBaseHeaders(res);
    const { pathname } = new URL(req.url || "/", "http://localhost");

    if (req.method === "GET" && pathname === "/api/health") {
      const readiness = buildReadinessStatus();
      sendJson(res, 200, {
        ok: true,
        service: "truth-world",
        aiProvider: readiness.providers.copilot.provider,
        translationProvider: readiness.providers.translation.provider,
        sourceProvider: readiness.sourceProvider,
        readiness
      });
      return;
    }

    if (req.method === "GET" && pathname === "/api/readiness") {
      sendJson(res, 200, buildReadinessStatus());
      return;
    }

    if (req.method === "GET" && pathname === "/api/feed") {
      await handleFeed(req, res, quotas);
      return;
    }

    if (req.method === "GET" && pathname === "/api/auth/me") {
      await handleAuth(req, res, "me", quotas);
      return;
    }

    if (req.method === "GET" && pathname === "/api/auth/write-eligibility") {
      await handleAuth(req, res, "write-eligibility", quotas);
      return;
    }

    if (req.method === "POST" && pathname === "/api/auth/phone/start") {
      await handleAuth(req, res, "phone-start", quotas);
      return;
    }

    if (req.method === "POST" && pathname === "/api/auth/phone/check") {
      await handleAuth(req, res, "phone-check", quotas);
      return;
    }

    if (req.method === "POST" && pathname === "/api/auth/signup") {
      await handleAuth(req, res, "signup", quotas);
      return;
    }

    if (req.method === "POST" && pathname === "/api/auth/login") {
      await handleAuth(req, res, "login", quotas);
      return;
    }

    if (req.method === "POST" && pathname === "/api/auth/logout") {
      await handleAuth(req, res, "logout", quotas);
      return;
    }

    if (req.method === "POST" && pathname === "/api/write/action") {
      await handleWriteAction(req, res, quotas);
      return;
    }

    if (req.method === "POST" && pathname === "/api/summarize") {
      await handleSummarize(req, res, quotas);
      return;
    }

    if (req.method === "POST" && pathname === "/api/translate") {
      await handleTranslate(req, res, quotas);
      return;
    }

    if (req.method !== "GET") {
      sendJson(res, 405, { error: { code: "METHOD_NOT_ALLOWED", message: "Method not allowed." } });
      return;
    }

    await serveStatic(req, res);
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  createTruthWorldServer().listen(port, host, () => {
    console.log(`Truth World is running at http://${host}:${port}`);
  });
}
