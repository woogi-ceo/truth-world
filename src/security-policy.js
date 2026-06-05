export function isProductionEnv(env = process.env) {
  const value = String(env.TRUTH_WORLD_ENV || env.NODE_ENV || "").trim().toLowerCase();
  return value === "production";
}

export function isLocalHost(host = "") {
  const name = String(host || "").split(":")[0].toLowerCase();
  return name === "localhost" || name === "127.0.0.1" || name === "::1" || name === "[::1]";
}

export function isLocalAddress(address = "") {
  const normalized = normalizeAddress(address).toLowerCase();
  return normalized === "localhost" || normalized === "127.0.0.1" || normalized === "::1";
}

function csv(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeAddress(value = "") {
  return String(value || "")
    .trim()
    .replace(/^\[|\]$/g, "")
    .replace(/^::ffff:/i, "");
}

export function trustProxyHeaders(req, env = process.env) {
  if (String(env.TRUTH_WORLD_TRUST_PROXY_HEADERS || "").trim() !== "1") return false;
  const allowed = csv(env.TRUTH_WORLD_TRUSTED_PROXY_IPS).map(normalizeAddress);
  if (!allowed.length) return false;
  if (isProductionEnv(env) && allowed.includes("*")) return false;
  const remote = normalizeAddress(req.socket?.remoteAddress || "");
  return allowed.includes(remote) || allowed.includes("*");
}

export function isSecureRequest(req, env = process.env) {
  if (req.socket?.encrypted) return true;
  if (!trustProxyHeaders(req, env)) return false;
  return String(req.headers?.["x-forwarded-proto"] || "").split(",")[0].trim() === "https";
}

export function requireSecureAuthTransport(req, env = process.env) {
  if (!isProductionEnv(env) || isSecureRequest(req, env)) return;
  const err = new Error("Production authentication requires HTTPS.");
  err.status = 403;
  err.code = "INSECURE_AUTH_TRANSPORT";
  throw err;
}

export function shouldUseSecureCookies(req, env = process.env) {
  return isProductionEnv(env) || isSecureRequest(req, env);
}

export function clientAddress(req, env = process.env) {
  const forwarded = trustProxyHeaders(req, env)
    ? String(req.headers?.["x-forwarded-for"] || "").split(",")[0].trim()
    : "";
  return forwarded || req.socket?.remoteAddress || "local";
}

export function isLocalClient(req, env = process.env) {
  return isLocalAddress(clientAddress(req, env));
}

export function requestHost(req) {
  return String(req.headers?.host || "").trim();
}
