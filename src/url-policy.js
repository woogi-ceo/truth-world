import { isProductionEnv } from "./security-policy.js";

const DEFAULT_IMAGE = "/assets/preview-policy.svg";
const SAFE_RELATIVE_ASSET = /^\/assets\/[a-z0-9._/-]+\.(svg|png|jpg|jpeg|webp)$/i;
const DEFAULT_SOURCE_HOSTS = ["truthsocial.com", "www.truthsocial.com"];

function csvSet(value, fallback = []) {
  const items = String(value || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  return new Set(items.length ? items : fallback);
}

function hostAllowed(hostname, allowlist) {
  if (allowlist.has("*")) return true;
  if (!allowlist.size) return false;
  const host = String(hostname || "").toLowerCase();
  return allowlist.has(host) || [...allowlist].some((allowed) => host.endsWith(`.${allowed}`));
}

export function safeSourceUrl(value, { env = process.env, fallback = "#" } = {}) {
  const raw = String(value || "").trim();
  if (!raw || raw === "#") return fallback;

  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" && url.protocol !== "http:") return fallback;
    if (isProductionEnv(env) && url.protocol !== "https:") return fallback;
    const allowedHosts = csvSet(env.TRUTH_WORLD_ALLOWED_SOURCE_HOSTS, DEFAULT_SOURCE_HOSTS);
    if (isProductionEnv(env) && allowedHosts.has("*")) return fallback;
    if (!hostAllowed(url.hostname, allowedHosts)) return fallback;
    return url.href;
  } catch {
    return fallback;
  }
}

export function safeImageUrl(value, { env = process.env, fallback = DEFAULT_IMAGE } = {}) {
  const raw = String(value || "").trim();
  if (!raw) return fallback;

  if (SAFE_RELATIVE_ASSET.test(raw) && !raw.includes("..")) return raw;

  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" && url.protocol !== "http:") return fallback;
    if (isProductionEnv(env) && url.protocol !== "https:") return fallback;
    const allowedHosts = csvSet(env.TRUTH_WORLD_ALLOWED_MEDIA_HOSTS);
    if (isProductionEnv(env) && allowedHosts.has("*")) return fallback;
    if (!hostAllowed(url.hostname, allowedHosts)) return fallback;
    return url.href;
  } catch {
    return fallback;
  }
}

export function sourceDomain(sourceUrl, fallback = "partner.source") {
  try {
    const url = new URL(sourceUrl);
    return url.hostname;
  } catch {
    return fallback;
  }
}

export function trustedProviderUrl(value, { env = process.env, label = "provider URL" } = {}) {
  try {
    const url = new URL(String(value || "").trim());
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      throw new Error("unsupported protocol");
    }
    if (isProductionEnv(env) && url.protocol !== "https:") {
      const err = new Error(`${label} must use HTTPS in production.`);
      err.status = 503;
      err.code = "UNSAFE_PROVIDER_URL";
      throw err;
    }
    return url;
  } catch (error) {
    if (error.code === "UNSAFE_PROVIDER_URL") throw error;
    const err = new Error(`${label} is not a valid URL.`);
    err.status = 503;
    err.code = "INVALID_PROVIDER_URL";
    throw err;
  }
}

export { DEFAULT_IMAGE };
