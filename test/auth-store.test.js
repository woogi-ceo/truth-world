import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { getSessionUser, login, logout, signup } from "../src/auth-store.js";

test("auth store signs up, logs in, and clears sessions", async () => {
  const dir = await mkdtemp(join(tmpdir(), "truth-world-auth-store-"));
  const storePath = join(dir, "auth.json");

  const created = await signup({
    displayName: "Reader One",
    email: "READER@example.com",
    password: "password123",
    countryCode: "KR",
    phoneNumber: "+821012345678"
  }, { storePath });

  assert.equal(created.user.email, "reader@example.com");
  assert.equal(created.user.displayName, "Reader One");
  assert.equal(created.user.phoneVerification.status, "verified");
  assert.equal(created.user.phoneVerification.countryCode, "KR");
  assert.equal(created.user.writeEligible, true);
  assert.ok(created.sessionToken);

  const sessionUser = await getSessionUser(created.sessionToken, { storePath });
  assert.equal(sessionUser.email, "reader@example.com");

  await assert.rejects(
    signup({
      email: "reader@example.com",
      password: "password123",
      countryCode: "KR",
      phoneNumber: "+821012345678"
    }, { storePath }),
    /already exists/
  );

  await assert.rejects(
    login({ email: "reader@example.com", password: "wrong-password" }, { storePath }),
    /incorrect/
  );

  const loggedIn = await login({ email: "reader@example.com", password: "password123" }, { storePath });
  assert.equal(loggedIn.user.email, "reader@example.com");

  await logout(loggedIn.sessionToken, { storePath });
  assert.equal(await getSessionUser(loggedIn.sessionToken, { storePath }), null);
});

test("auth store keeps production signup pending until phone verification is approved", async () => {
  const dir = await mkdtemp(join(tmpdir(), "truth-world-auth-store-"));
  const storePath = join(dir, "auth.json");
  const env = {
    NODE_ENV: "production",
    TRUTH_WORLD_PHONE_VERIFICATION_MODE: "external",
    TRUTH_WORLD_PHONE_VERIFY_START_URL: "https://verify.example/start",
    TRUTH_WORLD_PHONE_VERIFY_CHECK_URL: "https://verify.example/check",
    TRUTH_WORLD_PHONE_VERIFY_API_KEY: "verify-key"
  };

  const created = await signup({
    displayName: "Verified Later",
    email: "later@example.com",
    password: "password123",
    countryCode: "US",
    phoneNumber: "+14155552671"
  }, { storePath, env });

  assert.equal(created.user.phoneVerification.status, "pending");
  assert.equal(created.user.writeEligible, false);
});
