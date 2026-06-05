import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Readable } from "node:stream";
import test from "node:test";

import { createTruthWorldServer } from "../server.js";

async function dispatch(server, { method = "GET", url = "/", headers = {}, body = "", encrypted = false, remoteAddress = "127.0.0.1" } = {}) {
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

test("auth API creates a cookie session and reports current user", async () => {
  const oldStore = process.env.TRUTH_WORLD_AUTH_STORE;
  const dir = await mkdtemp(join(tmpdir(), "truth-world-auth-api-"));
  process.env.TRUTH_WORLD_AUTH_STORE = join(dir, "auth.json");

  const server = createTruthWorldServer();
  const origin = "http://127.0.0.1:4173";

  try {
    const signupResponse = await dispatch(server, {
      method: "POST",
      url: "/api/auth/signup",
      headers: {
        "content-type": "application/json",
        host: "127.0.0.1:4173",
        origin
      },
      body: JSON.stringify({
        displayName: "API Reader",
        email: "api@example.com",
        password: "password123",
        countryCode: "KR",
        phoneNumber: "+821012345678"
      })
    });

    assert.equal(signupResponse.status, 201);
    const cookie = signupResponse.headers["set-cookie"];
    assert.match(cookie, /tw_session=/);
    assert.match(cookie, /HttpOnly/);
    assert.match(cookie, /SameSite=Lax/);
    assert.equal(signupResponse.json.authenticated, true);
    assert.equal(signupResponse.json.user.email, "api@example.com");
    assert.equal(signupResponse.json.user.writeEligible, true);

    const meResponse = await dispatch(server, {
      url: "/api/auth/me",
      headers: {
        host: "127.0.0.1:4173",
        cookie
      }
    });
    assert.equal(meResponse.status, 200);
    assert.equal(meResponse.json.authenticated, true);
    assert.equal(meResponse.json.user.displayName, "API Reader");
    assert.equal(meResponse.json.user.phoneVerification.countryCode, "KR");

    const eligibilityResponse = await dispatch(server, {
      url: "/api/auth/write-eligibility",
      headers: {
        host: "127.0.0.1:4173",
        cookie
      }
    });
    assert.equal(eligibilityResponse.status, 200);
    assert.equal(eligibilityResponse.json.writeEligible, true);

    const logoutResponse = await dispatch(server, {
      method: "POST",
      url: "/api/auth/logout",
      headers: {
        host: "127.0.0.1:4173",
        origin,
        cookie
      }
    });
    assert.equal(logoutResponse.status, 200);
    assert.match(logoutResponse.headers["set-cookie"], /Max-Age=0/);
  } finally {
    if (oldStore === undefined) {
      delete process.env.TRUTH_WORLD_AUTH_STORE;
    } else {
      process.env.TRUTH_WORLD_AUTH_STORE = oldStore;
    }
  }
});

test("production auth rejects insecure transport and forces Secure cookies on HTTPS", async () => {
  const oldStore = process.env.TRUTH_WORLD_AUTH_STORE;
  const oldNodeEnv = process.env.NODE_ENV;
  const dir = await mkdtemp(join(tmpdir(), "truth-world-auth-api-"));
  process.env.TRUTH_WORLD_AUTH_STORE = join(dir, "auth.json");
  process.env.NODE_ENV = "production";

  const server = createTruthWorldServer();
  const insecureOrigin = "http://127.0.0.1:4173";
  const secureOrigin = "https://127.0.0.1:4173";
  const body = JSON.stringify({
    displayName: "Secure Reader",
    email: "secure@example.com",
    password: "password123",
    countryCode: "US",
    phoneNumber: "+14155552671"
  });

  try {
    const insecure = await dispatch(server, {
      method: "POST",
      url: "/api/auth/signup",
      headers: {
        "content-type": "application/json",
        host: "127.0.0.1:4173",
        origin: insecureOrigin
      },
      body
    });
    assert.equal(insecure.status, 403);
    assert.equal(insecure.json.error.code, "INSECURE_AUTH_TRANSPORT");

    const spoofedForwardedProto = await dispatch(server, {
      method: "POST",
      url: "/api/auth/signup",
      headers: {
        "content-type": "application/json",
        host: "127.0.0.1:4173",
        origin: secureOrigin,
        "x-forwarded-proto": "https"
      },
      body
    });
    assert.equal(spoofedForwardedProto.status, 403);
    assert.equal(spoofedForwardedProto.json.error.code, "INSECURE_AUTH_TRANSPORT");

    const secure = await dispatch(server, {
      method: "POST",
      url: "/api/auth/signup",
      headers: {
        "content-type": "application/json",
        host: "127.0.0.1:4173",
        origin: secureOrigin
      },
      body,
      encrypted: true
    });
    assert.equal(secure.status, 201);
    assert.match(secure.headers["set-cookie"], /Secure/);
    assert.equal(secure.json.user.writeEligible, false);
  } finally {
    if (oldStore === undefined) {
      delete process.env.TRUTH_WORLD_AUTH_STORE;
    } else {
      process.env.TRUTH_WORLD_AUTH_STORE = oldStore;
    }
    if (oldNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = oldNodeEnv;
    }
  }
});

test("trusted proxy headers require explicit proxy allowlist", async () => {
  const oldStore = process.env.TRUTH_WORLD_AUTH_STORE;
  const oldNodeEnv = process.env.NODE_ENV;
  const oldTrustProxy = process.env.TRUTH_WORLD_TRUST_PROXY_HEADERS;
  const oldTrustedIps = process.env.TRUTH_WORLD_TRUSTED_PROXY_IPS;
  const dir = await mkdtemp(join(tmpdir(), "truth-world-auth-api-"));
  process.env.TRUTH_WORLD_AUTH_STORE = join(dir, "auth.json");
  process.env.NODE_ENV = "production";
  process.env.TRUTH_WORLD_TRUST_PROXY_HEADERS = "1";
  process.env.TRUTH_WORLD_TRUSTED_PROXY_IPS = "10.0.0.7";

  const server = createTruthWorldServer();
  const secureOrigin = "https://truthworld.example";

  try {
    const response = await dispatch(server, {
      method: "POST",
      url: "/api/auth/signup",
      remoteAddress: "10.0.0.7",
      headers: {
        "content-type": "application/json",
        host: "truthworld.example",
        origin: secureOrigin,
        "x-forwarded-proto": "https",
        "x-forwarded-for": "198.51.100.77"
      },
      body: JSON.stringify({
        displayName: "Proxy Reader",
        email: "proxy@example.com",
        password: "password123",
        countryCode: "US",
        phoneNumber: "+14155552672"
      })
    });

    assert.equal(response.status, 201);
    assert.match(response.headers["set-cookie"], /Secure/);
  } finally {
    if (oldStore === undefined) delete process.env.TRUTH_WORLD_AUTH_STORE;
    else process.env.TRUTH_WORLD_AUTH_STORE = oldStore;
    if (oldNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = oldNodeEnv;
    if (oldTrustProxy === undefined) delete process.env.TRUTH_WORLD_TRUST_PROXY_HEADERS;
    else process.env.TRUTH_WORLD_TRUST_PROXY_HEADERS = oldTrustProxy;
    if (oldTrustedIps === undefined) delete process.env.TRUTH_WORLD_TRUSTED_PROXY_IPS;
    else process.env.TRUTH_WORLD_TRUSTED_PROXY_IPS = oldTrustedIps;
  }
});

test("phone verification API promotes a pending account to write eligible", async () => {
  const oldStore = process.env.TRUTH_WORLD_AUTH_STORE;
  const oldMode = process.env.TRUTH_WORLD_PHONE_VERIFICATION_MODE;
  const oldCode = process.env.TRUTH_WORLD_DEV_PHONE_CODE;
  const dir = await mkdtemp(join(tmpdir(), "truth-world-auth-api-"));
  process.env.TRUTH_WORLD_AUTH_STORE = join(dir, "auth.json");
  process.env.TRUTH_WORLD_PHONE_VERIFICATION_MODE = "dev_code";
  process.env.TRUTH_WORLD_DEV_PHONE_CODE = "123456";

  const server = createTruthWorldServer();
  const origin = "http://127.0.0.1:4173";

  try {
    const signupResponse = await dispatch(server, {
      method: "POST",
      url: "/api/auth/signup",
      headers: {
        "content-type": "application/json",
        host: "127.0.0.1:4173",
        origin
      },
      body: JSON.stringify({
        displayName: "Pending Reader",
        email: "pending@example.com",
        password: "password123",
        countryCode: "KR",
        phoneNumber: "+821012345678"
      })
    });
    assert.equal(signupResponse.status, 201);
    assert.equal(signupResponse.json.user.writeEligible, false);
    const cookie = signupResponse.headers["set-cookie"];

    const start = await dispatch(server, {
      method: "POST",
      url: "/api/auth/phone/start",
      headers: {
        "content-type": "application/json",
        host: "127.0.0.1:4173",
        origin,
        cookie
      }
    });
    assert.equal(start.status, 200);
    assert.equal(start.json.challenge.developmentCode, "123456");

    const check = await dispatch(server, {
      method: "POST",
      url: "/api/auth/phone/check",
      headers: {
        "content-type": "application/json",
        host: "127.0.0.1:4173",
        origin,
        cookie
      },
      body: JSON.stringify({ code: "123456" })
    });
    assert.equal(check.status, 200);
    assert.equal(check.json.writeEligible, true);
    assert.equal(check.json.user.phoneVerification.status, "verified");
  } finally {
    if (oldStore === undefined) delete process.env.TRUTH_WORLD_AUTH_STORE;
    else process.env.TRUTH_WORLD_AUTH_STORE = oldStore;
    if (oldMode === undefined) delete process.env.TRUTH_WORLD_PHONE_VERIFICATION_MODE;
    else process.env.TRUTH_WORLD_PHONE_VERIFICATION_MODE = oldMode;
    if (oldCode === undefined) delete process.env.TRUTH_WORLD_DEV_PHONE_CODE;
    else process.env.TRUTH_WORLD_DEV_PHONE_CODE = oldCode;
  }
});
