import assert from "node:assert/strict";
import { mkdtemp, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Readable } from "node:stream";
import test from "node:test";

import { createTruthWorldServer } from "../server.js";

async function dispatch(server, { method = "GET", url = "/", headers = {}, body = "", encrypted = false, remoteAddress = "203.0.113.10" } = {}) {
  const req = Readable.from(body ? [body] : []);
  req.method = method;
  req.url = url;
  req.headers = headers;
  req.socket = { encrypted, remoteAddress };

  let statusCode = 0;
  let responseBody = "";
  const responseHeaders = {};
  const res = {
    setHeader(name, value) {
      responseHeaders[name.toLowerCase()] = value;
    },
    writeHead(status, headersToSet = {}) {
      statusCode = status;
      Object.entries(headersToSet).forEach(([name, value]) => {
        responseHeaders[name.toLowerCase()] = value;
      });
    },
    end(payload = "") {
      responseBody = String(payload);
    }
  };

  await server.listeners("request")[0](req, res);
  return {
    status: statusCode,
    headers: responseHeaders,
    json: responseBody ? JSON.parse(responseBody) : null
  };
}

test("AI endpoint quota returns 429 before repeated provider work", async () => {
  const oldMax = process.env.TRUTH_WORLD_AI_QUOTA_MAX;
  const oldWindow = process.env.TRUTH_WORLD_AI_QUOTA_WINDOW_MS;
  process.env.TRUTH_WORLD_AI_QUOTA_MAX = "1";
  process.env.TRUTH_WORLD_AI_QUOTA_WINDOW_MS = "60000";

  const server = createTruthWorldServer();

  try {
    const body = JSON.stringify({
      text: "This source text is long enough to satisfy validation.",
      targetLanguage: "ko"
    });
    const first = await dispatch(server, {
      method: "POST",
      url: "/api/summarize",
      headers: {
        "content-type": "application/json",
        host: "127.0.0.1:4173"
      },
      body
    });
    assert.equal(first.status, 503);

    const second = await dispatch(server, {
      method: "POST",
      url: "/api/summarize",
      headers: {
        "content-type": "application/json",
        host: "127.0.0.1:4173"
      },
      body
    });
    assert.equal(second.status, 429);
    assert.equal(second.json.error.code, "RATE_LIMITED");
  } finally {
    if (oldMax === undefined) delete process.env.TRUTH_WORLD_AI_QUOTA_MAX;
    else process.env.TRUTH_WORLD_AI_QUOTA_MAX = oldMax;
    if (oldWindow === undefined) delete process.env.TRUTH_WORLD_AI_QUOTA_WINDOW_MS;
    else process.env.TRUTH_WORLD_AI_QUOTA_WINDOW_MS = oldWindow;
  }
});

test("feed endpoint quota returns 429 without requiring partner credentials", async () => {
  const oldMax = process.env.TRUTH_WORLD_FEED_QUOTA_MAX;
  const oldWindow = process.env.TRUTH_WORLD_FEED_QUOTA_WINDOW_MS;
  process.env.TRUTH_WORLD_FEED_QUOTA_MAX = "1";
  process.env.TRUTH_WORLD_FEED_QUOTA_WINDOW_MS = "60000";

  const server = createTruthWorldServer();

  try {
    const first = await dispatch(server, {
      url: "/api/feed",
      headers: { host: "127.0.0.1:4173" }
    });
    assert.equal(first.status, 200);

    const second = await dispatch(server, {
      url: "/api/feed",
      headers: { host: "127.0.0.1:4173" }
    });
    assert.equal(second.status, 429);
    assert.equal(second.json.error.code, "RATE_LIMITED");
  } finally {
    if (oldMax === undefined) delete process.env.TRUTH_WORLD_FEED_QUOTA_MAX;
    else process.env.TRUTH_WORLD_FEED_QUOTA_MAX = oldMax;
    if (oldWindow === undefined) delete process.env.TRUTH_WORLD_FEED_QUOTA_WINDOW_MS;
    else process.env.TRUTH_WORLD_FEED_QUOTA_WINDOW_MS = oldWindow;
  }
});

test("quota ignores spoofed forwarded-for when proxy headers are not trusted", async () => {
  const oldMax = process.env.TRUTH_WORLD_FEED_QUOTA_MAX;
  const oldWindow = process.env.TRUTH_WORLD_FEED_QUOTA_WINDOW_MS;
  const oldTrust = process.env.TRUTH_WORLD_TRUST_PROXY_HEADERS;
  process.env.TRUTH_WORLD_FEED_QUOTA_MAX = "1";
  process.env.TRUTH_WORLD_FEED_QUOTA_WINDOW_MS = "60000";
  delete process.env.TRUTH_WORLD_TRUST_PROXY_HEADERS;

  const server = createTruthWorldServer();

  try {
    const first = await dispatch(server, {
      url: "/api/feed",
      headers: { host: "127.0.0.1:4173", "x-forwarded-for": "198.51.100.1" }
    });
    assert.equal(first.status, 200);

    const second = await dispatch(server, {
      url: "/api/feed",
      headers: { host: "127.0.0.1:4173", "x-forwarded-for": "198.51.100.2" }
    });
    assert.equal(second.status, 429);
    assert.equal(second.json.error.code, "RATE_LIMITED");
  } finally {
    if (oldMax === undefined) delete process.env.TRUTH_WORLD_FEED_QUOTA_MAX;
    else process.env.TRUTH_WORLD_FEED_QUOTA_MAX = oldMax;
    if (oldWindow === undefined) delete process.env.TRUTH_WORLD_FEED_QUOTA_WINDOW_MS;
    else process.env.TRUTH_WORLD_FEED_QUOTA_WINDOW_MS = oldWindow;
    if (oldTrust === undefined) delete process.env.TRUTH_WORLD_TRUST_PROXY_HEADERS;
    else process.env.TRUTH_WORLD_TRUST_PROXY_HEADERS = oldTrust;
  }
});

test("malformed percent-encoded static paths fail closed", async () => {
  const server = createTruthWorldServer();
  const response = await dispatch(server, {
    url: "/%E0%A4%A",
    headers: { host: "127.0.0.1:4173" }
  });

  assert.equal(response.status, 400);
  assert.equal(response.json.error.code, "BAD_PATH");
});

test("API route dispatch requires exact route paths", async () => {
  const server = createTruthWorldServer();
  const response = await dispatch(server, {
    method: "POST",
    url: "/api/auth/login-extra",
    headers: {
      "content-type": "application/json",
      host: "127.0.0.1:4173",
      origin: "http://127.0.0.1:4173"
    },
    body: JSON.stringify({ email: "a@example.com", password: "password123" })
  });

  assert.equal(response.status, 405);
  assert.equal(response.json.error.code, "METHOD_NOT_ALLOWED");
});

test("production state-changing endpoints reject missing Origin", async () => {
  const oldEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";
  const server = createTruthWorldServer();

  try {
    const response = await dispatch(server, {
      method: "POST",
      url: "/api/auth/login",
      encrypted: true,
      headers: {
        "content-type": "application/json",
        host: "truthworld.example"
      },
      body: JSON.stringify({ email: "a@example.com", password: "password123" })
    });

    assert.equal(response.status, 403);
    assert.equal(response.json.error.code, "MISSING_ORIGIN");
  } finally {
    if (oldEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = oldEnv;
  }
});

test("Codex translation fallback is local-host only when xAI is absent", async () => {
  const oldXai = process.env.XAI_API_KEY;
  const oldCommand = process.env.CODEX_TRANSLATION_COMMAND;
  const oldRemote = process.env.TRUTH_WORLD_ALLOW_REMOTE_CODEX_TRANSLATION;
  delete process.env.XAI_API_KEY;
  process.env.CODEX_TRANSLATION_COMMAND = "/bin/sh";
  delete process.env.TRUTH_WORLD_ALLOW_REMOTE_CODEX_TRANSLATION;
  const server = createTruthWorldServer();

  try {
    const response = await dispatch(server, {
      method: "POST",
      url: "/api/translate",
      headers: {
        "content-type": "application/json",
        host: "truthworld.example"
      },
      body: JSON.stringify({
        targetLanguage: "Korean",
        items: [{ id: "item", type: "ui", fields: { title: "Hello" } }]
      })
    });

    assert.equal(response.status, 503);
    assert.equal(response.json.error.code, "CODEX_FALLBACK_LOCAL_ONLY");
  } finally {
    if (oldXai === undefined) delete process.env.XAI_API_KEY;
    else process.env.XAI_API_KEY = oldXai;
    if (oldCommand === undefined) delete process.env.CODEX_TRANSLATION_COMMAND;
    else process.env.CODEX_TRANSLATION_COMMAND = oldCommand;
    if (oldRemote === undefined) delete process.env.TRUTH_WORLD_ALLOW_REMOTE_CODEX_TRANSLATION;
    else process.env.TRUTH_WORLD_ALLOW_REMOTE_CODEX_TRANSLATION = oldRemote;
  }
});

test("Codex local-only fallback ignores spoofed localhost Host headers", async () => {
  const oldXai = process.env.XAI_API_KEY;
  const oldCommand = process.env.CODEX_TRANSLATION_COMMAND;
  const oldRemote = process.env.TRUTH_WORLD_ALLOW_REMOTE_CODEX_TRANSLATION;
  delete process.env.XAI_API_KEY;
  process.env.CODEX_TRANSLATION_COMMAND = "/bin/sh";
  delete process.env.TRUTH_WORLD_ALLOW_REMOTE_CODEX_TRANSLATION;
  const server = createTruthWorldServer();

  try {
    const response = await dispatch(server, {
      method: "POST",
      url: "/api/translate",
      remoteAddress: "203.0.113.10",
      headers: {
        "content-type": "application/json",
        host: "127.0.0.1:4173"
      },
      body: JSON.stringify({
        targetLanguage: "Korean",
        items: [{ id: "item", type: "ui", fields: { title: "Hello" } }]
      })
    });

    assert.equal(response.status, 503);
    assert.equal(response.json.error.code, "CODEX_FALLBACK_LOCAL_ONLY");
  } finally {
    if (oldXai === undefined) delete process.env.XAI_API_KEY;
    else process.env.XAI_API_KEY = oldXai;
    if (oldCommand === undefined) delete process.env.CODEX_TRANSLATION_COMMAND;
    else process.env.CODEX_TRANSLATION_COMMAND = oldCommand;
    if (oldRemote === undefined) delete process.env.TRUTH_WORLD_ALLOW_REMOTE_CODEX_TRANSLATION;
    else process.env.TRUTH_WORLD_ALLOW_REMOTE_CODEX_TRANSLATION = oldRemote;
  }
});

test("production auth requires an explicit auth store path", async () => {
  const oldStore = process.env.TRUTH_WORLD_AUTH_STORE;
  const oldNodeEnv = process.env.NODE_ENV;
  delete process.env.TRUTH_WORLD_AUTH_STORE;
  process.env.NODE_ENV = "production";
  const server = createTruthWorldServer();

  try {
    const response = await dispatch(server, {
      method: "POST",
      url: "/api/auth/signup",
      encrypted: true,
      headers: {
        "content-type": "application/json",
        host: "truthworld.example",
        origin: "https://truthworld.example"
      },
      body: JSON.stringify({
        displayName: "No Store",
        email: "nostore@example.com",
        password: "password123",
        countryCode: "US",
        phoneNumber: "+14155552673"
      })
    });

    assert.equal(response.status, 503);
    assert.equal(response.json.error.code, "AUTH_STORE_NOT_CONFIGURED");
  } finally {
    if (oldStore === undefined) delete process.env.TRUTH_WORLD_AUTH_STORE;
    else process.env.TRUTH_WORLD_AUTH_STORE = oldStore;
    if (oldNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = oldNodeEnv;
  }
});

test("write action requires verified phone and country on the server", async () => {
  const oldStore = process.env.TRUTH_WORLD_AUTH_STORE;
  const oldMode = process.env.TRUTH_WORLD_PHONE_VERIFICATION_MODE;
  const dir = await mkdtemp(join(tmpdir(), "truth-world-write-action-"));
  process.env.TRUTH_WORLD_AUTH_STORE = join(dir, "auth.json");
  process.env.TRUTH_WORLD_PHONE_VERIFICATION_MODE = "dev_code";
  const server = createTruthWorldServer();
  const origin = "http://127.0.0.1:4173";

  try {
    const signup = await dispatch(server, {
      method: "POST",
      url: "/api/auth/signup",
      headers: {
        "content-type": "application/json",
        host: "127.0.0.1:4173",
        origin
      },
      body: JSON.stringify({
        displayName: "Write Pending",
        email: "write-pending@example.com",
        password: "password123",
        countryCode: "KR",
        phoneNumber: "+821012345678"
      })
    });
    assert.equal(signup.status, 201);
    assert.equal(signup.json.user.writeEligible, false);

    const action = await dispatch(server, {
      method: "POST",
      url: "/api/write/action",
      headers: {
        "content-type": "application/json",
        host: "127.0.0.1:4173",
        origin,
        cookie: signup.headers["set-cookie"]
      },
      body: JSON.stringify({ action: "topic.follow", target: "#KoreaSecurity" })
    });

    assert.equal(action.status, 403);
    assert.equal(action.json.error.code, "WRITE_ELIGIBILITY_REQUIRED");
  } finally {
    if (oldStore === undefined) delete process.env.TRUTH_WORLD_AUTH_STORE;
    else process.env.TRUTH_WORLD_AUTH_STORE = oldStore;
    if (oldMode === undefined) delete process.env.TRUTH_WORLD_PHONE_VERIFICATION_MODE;
    else process.env.TRUTH_WORLD_PHONE_VERIFICATION_MODE = oldMode;
  }
});

test("invalid session probes do not create or rewrite the auth store", async () => {
  const oldStore = process.env.TRUTH_WORLD_AUTH_STORE;
  const dir = await mkdtemp(join(tmpdir(), "truth-world-session-probe-"));
  const storePath = join(dir, "auth.json");
  process.env.TRUTH_WORLD_AUTH_STORE = storePath;
  const server = createTruthWorldServer();

  try {
    const response = await dispatch(server, {
      url: "/api/auth/me",
      headers: {
        host: "127.0.0.1:4173",
        cookie: "tw_session=attacker-controlled-token"
      }
    });

    assert.equal(response.status, 200);
    assert.equal(response.json.authenticated, false);
    await assert.rejects(stat(storePath), { code: "ENOENT" });
  } finally {
    if (oldStore === undefined) delete process.env.TRUTH_WORLD_AUTH_STORE;
    else process.env.TRUTH_WORLD_AUTH_STORE = oldStore;
  }
});

test("auth session probe endpoint is quota limited", async () => {
  const oldMax = process.env.TRUTH_WORLD_AUTH_QUOTA_MAX;
  const oldWindow = process.env.TRUTH_WORLD_AUTH_QUOTA_WINDOW_MS;
  process.env.TRUTH_WORLD_AUTH_QUOTA_MAX = "1";
  process.env.TRUTH_WORLD_AUTH_QUOTA_WINDOW_MS = "60000";
  const server = createTruthWorldServer();

  try {
    const first = await dispatch(server, {
      url: "/api/auth/me",
      headers: { host: "127.0.0.1:4173", cookie: "tw_session=a" }
    });
    assert.equal(first.status, 200);

    const second = await dispatch(server, {
      url: "/api/auth/me",
      headers: { host: "127.0.0.1:4173", cookie: "tw_session=b" }
    });
    assert.equal(second.status, 429);
    assert.equal(second.json.error.code, "RATE_LIMITED");
  } finally {
    if (oldMax === undefined) delete process.env.TRUTH_WORLD_AUTH_QUOTA_MAX;
    else process.env.TRUTH_WORLD_AUTH_QUOTA_MAX = oldMax;
    if (oldWindow === undefined) delete process.env.TRUTH_WORLD_AUTH_QUOTA_WINDOW_MS;
    else process.env.TRUTH_WORLD_AUTH_QUOTA_WINDOW_MS = oldWindow;
  }
});
