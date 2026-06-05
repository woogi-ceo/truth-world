import { clientAddress } from "./security-policy.js";

function positiveNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function createRateLimiter({ limit = 60, windowMs = 60_000, clock = () => Date.now() } = {}) {
  const buckets = new Map();

  return {
    consume(key, cost = 1) {
      const now = clock();
      const existing = buckets.get(key);
      const bucket = existing && existing.resetAt > now
        ? existing
        : { count: 0, resetAt: now + windowMs };

      bucket.count += cost;
      buckets.set(key, bucket);

      if (bucket.count > limit) {
        const err = new Error("Too many requests. Please try again later.");
        err.status = 429;
        err.code = "RATE_LIMITED";
        err.retryAfterSeconds = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
        throw err;
      }

      return {
        remaining: Math.max(0, limit - bucket.count),
        resetAt: bucket.resetAt
      };
    },
    reset() {
      buckets.clear();
    }
  };
}

export function createQuotaRegistry(env = process.env) {
  return {
    ai: createRateLimiter({
      limit: positiveNumber(env.TRUTH_WORLD_AI_QUOTA_MAX, 30),
      windowMs: positiveNumber(env.TRUTH_WORLD_AI_QUOTA_WINDOW_MS, 60_000)
    }),
    feed: createRateLimiter({
      limit: positiveNumber(env.TRUTH_WORLD_FEED_QUOTA_MAX, 120),
      windowMs: positiveNumber(env.TRUTH_WORLD_FEED_QUOTA_WINDOW_MS, 60_000)
    }),
    auth: createRateLimiter({
      limit: positiveNumber(env.TRUTH_WORLD_AUTH_QUOTA_MAX, 20),
      windowMs: positiveNumber(env.TRUTH_WORLD_AUTH_QUOTA_WINDOW_MS, 300_000)
    })
  };
}

export function quotaDisabled(env = process.env) {
  return String(env.TRUTH_WORLD_QUOTA_DISABLED || "").trim() === "1";
}

export function enforceQuota(limiter, req, scope, { env = process.env, keyParts = [] } = {}) {
  if (quotaDisabled(env)) return null;
  const key = [scope, clientAddress(req), ...keyParts.map((part) => String(part || "").trim().toLowerCase())]
    .filter(Boolean)
    .join(":");
  return limiter.consume(key);
}
