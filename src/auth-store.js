import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { promisify } from "node:util";

import {
  canAutoVerifyPhone,
  checkPhoneVerification,
  normalizeCountryCode,
  normalizePhoneNumber,
  publicPhoneVerificationStatus,
  startPhoneVerification,
  writeEligibilityFromVerification
} from "./phone-verification.js";
import { isProductionEnv } from "./security-policy.js";

const scrypt = promisify(scryptCallback);

export const SESSION_COOKIE = "tw_session";
const DEFAULT_SESSION_DAYS = 30;
const SCRYPT_OPTIONS = { N: 16_384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
const storeLocks = new Map();

function nowIso() {
  return new Date().toISOString();
}

function defaultStorePath(env = process.env) {
  const configured = String(env.TRUTH_WORLD_AUTH_STORE || "").trim();
  if (configured) return resolve(configured);
  if (isProductionEnv(env)) {
    const err = new Error("TRUTH_WORLD_AUTH_STORE is required in production.");
    err.status = 503;
    err.code = "AUTH_STORE_NOT_CONFIGURED";
    throw err;
  }
  return resolve("data/auth-store.dev.json");
}

function token() {
  return randomBytes(32).toString("base64url");
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function sanitizeDisplayName(name, email) {
  const text = String(name || "").trim().replace(/\s+/g, " ");
  if (text) return text.slice(0, 60);
  return normalizeEmail(email).split("@")[0] || "Truth World reader";
}

function validateCredentials({ email, password }) {
  const normalizedEmail = normalizeEmail(email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    const err = new Error("Enter a valid email address.");
    err.status = 400;
    err.code = "INVALID_EMAIL";
    throw err;
  }

  if (String(password || "").length < 8) {
    const err = new Error("Password must be at least 8 characters.");
    err.status = 400;
    err.code = "WEAK_PASSWORD";
    throw err;
  }

  return normalizedEmail;
}

function publicUser(user) {
  if (!user) return null;
  const phoneVerification = publicPhoneVerificationStatus(user);
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt || "",
    phoneVerification,
    countryCode: phoneVerification.countryCode,
    writeEligible: writeEligibilityFromVerification(phoneVerification)
  };
}

async function hashPassword(password, salt = token()) {
  const hash = await scrypt(String(password), salt, 64, SCRYPT_OPTIONS);
  return {
    algorithm: "scrypt",
    salt,
    hash: Buffer.from(hash).toString("base64url"),
    params: SCRYPT_OPTIONS
  };
}

async function verifyPassword(password, passwordHash) {
  if (passwordHash?.algorithm !== "scrypt" || !passwordHash.salt || !passwordHash.hash) return false;
  const candidate = await hashPassword(password, passwordHash.salt);
  const expected = Buffer.from(passwordHash.hash, "base64url");
  const actual = Buffer.from(candidate.hash, "base64url");
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

async function readStore(storePath = defaultStorePath()) {
  try {
    const store = JSON.parse(await readFile(storePath, "utf8"));
    return {
      users: Array.isArray(store.users) ? store.users : [],
      sessions: Array.isArray(store.sessions) ? store.sessions : []
    };
  } catch (error) {
    if (error.code === "ENOENT") return { users: [], sessions: [] };
    throw error;
  }
}

async function writeStore(store, storePath = defaultStorePath()) {
  await mkdir(dirname(storePath), { recursive: true });
  const tmpPath = `${storePath}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(tmpPath, JSON.stringify(store, null, 2), { mode: 0o600 });
  await rename(tmpPath, storePath);
}

async function withStoreLock(storePath, operation) {
  const resolvedPath = resolve(storePath);
  const previous = storeLocks.get(resolvedPath) || Promise.resolve();
  let release;
  const current = new Promise((resolveRelease) => {
    release = resolveRelease;
  });
  const queued = previous.then(() => current, () => current);
  storeLocks.set(resolvedPath, queued);

  try {
    await previous.catch(() => {});
    return await operation();
  } finally {
    release();
    if (storeLocks.get(resolvedPath) === queued) {
      storeLocks.delete(resolvedPath);
    }
  }
}

function pruneSessions(store) {
  const now = Date.now();
  store.sessions = store.sessions.filter((session) => Date.parse(session.expiresAt) > now);
}

function hashSessionToken(sessionToken) {
  return createHash("sha256").update(String(sessionToken)).digest("base64url");
}

function createSessionForUser(store, userId) {
  const sessionToken = token();
  const createdAt = nowIso();
  const expiresAt = new Date(Date.now() + DEFAULT_SESSION_DAYS * 24 * 60 * 60 * 1000).toISOString();
  store.sessions.push({
    id: token(),
    tokenHash: hashSessionToken(sessionToken),
    userId,
    createdAt,
    expiresAt
  });
  return { sessionToken, expiresAt };
}

export function parseCookies(header = "") {
  return Object.fromEntries(String(header || "")
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const index = part.indexOf("=");
      if (index === -1) return [part, ""];
      return [part.slice(0, index), decodeURIComponent(part.slice(index + 1))];
    }));
}

export function sessionCookieHeader(sessionToken, expiresAt, { secure = false } = {}) {
  const parts = [
    `${SESSION_COOKIE}=${encodeURIComponent(sessionToken)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Expires=${new Date(expiresAt).toUTCString()}`
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

export function clearSessionCookieHeader({ secure = false } = {}) {
  const parts = [
    `${SESSION_COOKIE}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0"
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

function buildPhoneVerification({ phoneNumber, countryCode, env }) {
  const normalizedPhone = normalizePhoneNumber(phoneNumber);
  const normalizedCountry = normalizeCountryCode(countryCode);
  const createdAt = nowIso();

  if (canAutoVerifyPhone(env)) {
    return {
      phoneNumber: normalizedPhone,
      countryCode: normalizedCountry,
      status: "verified",
      provider: "dev_auto",
      createdAt,
      verifiedAt: createdAt
    };
  }

  return {
    phoneNumber: normalizedPhone,
    countryCode: normalizedCountry,
    status: "pending",
    provider: "",
    createdAt,
    verifiedAt: ""
  };
}

function requireUser(store, userId) {
  const user = store.users.find((candidate) => candidate.id === userId);
  if (!user) {
    const err = new Error("Authenticated user was not found.");
    err.status = 401;
    err.code = "AUTH_USER_NOT_FOUND";
    throw err;
  }
  return user;
}

async function phoneVerificationSnapshot(userId, storePath) {
  return withStoreLock(storePath, async () => {
    const store = await readStore(storePath);
    const user = requireUser(store, userId);
    return { ...(user.phoneVerification || {}) };
  });
}

function assertSamePhoneTarget(current, expected) {
  if (current?.phoneNumber === expected?.phoneNumber && current?.countryCode === expected?.countryCode) {
    return;
  }

  const err = new Error("Phone verification target changed. Start verification again.");
  err.status = 409;
  err.code = "PHONE_VERIFICATION_TARGET_CHANGED";
  throw err;
}

export async function signup({ email, password, displayName, phoneNumber, countryCode }, { storePath = defaultStorePath(), env = process.env } = {}) {
  const normalizedEmail = validateCredentials({ email, password });
  const phoneVerification = buildPhoneVerification({ phoneNumber, countryCode, env });
  const passwordHash = await hashPassword(password);

  return withStoreLock(storePath, async () => {
    const store = await readStore(storePath);
    pruneSessions(store);

    if (store.users.some((user) => user.email === normalizedEmail)) {
      const err = new Error("An account with this email already exists.");
      err.status = 409;
      err.code = "EMAIL_EXISTS";
      throw err;
    }

    const createdAt = nowIso();
    const user = {
      id: token(),
      email: normalizedEmail,
      displayName: sanitizeDisplayName(displayName, normalizedEmail),
      phoneVerification,
      password: passwordHash,
      createdAt,
      lastLoginAt: createdAt
    };
    store.users.push(user);
    const session = createSessionForUser(store, user.id);
    await writeStore(store, storePath);
    return { user: publicUser(user), ...session };
  });
}

export async function login({ email, password }, { storePath = defaultStorePath() } = {}) {
  const normalizedEmail = normalizeEmail(email);
  return withStoreLock(storePath, async () => {
    const store = await readStore(storePath);
    pruneSessions(store);
    const user = store.users.find((candidate) => candidate.email === normalizedEmail);

    if (!user || !await verifyPassword(password, user.password)) {
      const err = new Error("Email or password is incorrect.");
      err.status = 401;
      err.code = "INVALID_LOGIN";
      throw err;
    }

    user.lastLoginAt = nowIso();
    const session = createSessionForUser(store, user.id);
    await writeStore(store, storePath);
    return { user: publicUser(user), ...session };
  });
}

export async function getSessionUser(sessionToken, { storePath = defaultStorePath() } = {}) {
  if (!sessionToken) return null;
  return withStoreLock(storePath, async () => {
    const store = await readStore(storePath);
    const now = Date.now();
    const tokenHash = hashSessionToken(sessionToken);
    const session = store.sessions.find((candidate) => (
      candidate.tokenHash === tokenHash && Date.parse(candidate.expiresAt) > now
    ));
    if (!session) return null;
    const user = store.users.find((candidate) => candidate.id === session.userId);
    return publicUser(user);
  });
}

export async function logout(sessionToken, { storePath = defaultStorePath() } = {}) {
  if (!sessionToken) return;
  return withStoreLock(storePath, async () => {
    const store = await readStore(storePath);
    const tokenHash = hashSessionToken(sessionToken);
    store.sessions = store.sessions.filter((session) => session.tokenHash !== tokenHash);
    await writeStore(store, storePath);
  });
}

export async function beginPhoneVerification(userId, {
  storePath = defaultStorePath(),
  env = process.env,
  fetchImpl = globalThis.fetch
} = {}) {
  const verification = await phoneVerificationSnapshot(userId, storePath);
  const challenge = await startPhoneVerification({
    phoneNumber: verification.phoneNumber,
    countryCode: verification.countryCode,
    env,
    fetchImpl
  });

  return withStoreLock(storePath, async () => {
    const store = await readStore(storePath);
    const user = requireUser(store, userId);
    const currentVerification = user.phoneVerification || {};
    assertSamePhoneTarget(currentVerification, verification);

    user.phoneVerification = {
      ...currentVerification,
      status: currentVerification.status === "verified" ? "verified" : "pending",
      provider: challenge.provider,
      challengeId: challenge.challengeId,
      lastChallengeAt: nowIso()
    };
    await writeStore(store, storePath);
    return {
      user: publicUser(user),
      challenge: {
        provider: challenge.provider,
        challengeId: challenge.challengeId,
        developmentCode: challenge.developmentCode || ""
      }
    };
  });
}

export async function completePhoneVerification(userId, code, {
  storePath = defaultStorePath(),
  env = process.env,
  fetchImpl = globalThis.fetch
} = {}) {
  const verification = await phoneVerificationSnapshot(userId, storePath);
  const result = await checkPhoneVerification({
    phoneNumber: verification.phoneNumber,
    countryCode: verification.countryCode,
    code,
    env,
    fetchImpl
  });

  if (!result.approved) {
    const err = new Error("Phone verification code was not approved.");
    err.status = 401;
    err.code = "PHONE_VERIFICATION_REJECTED";
    throw err;
  }

  return withStoreLock(storePath, async () => {
    const store = await readStore(storePath);
    const user = requireUser(store, userId);
    const currentVerification = user.phoneVerification || {};
    assertSamePhoneTarget(currentVerification, verification);

    user.phoneVerification = {
      ...currentVerification,
      status: "verified",
      provider: result.provider,
      verifiedAt: nowIso()
    };
    await writeStore(store, storePath);
    return { user: publicUser(user) };
  });
}
