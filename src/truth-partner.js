import { DEFAULT_IMAGE, safeImageUrl, safeSourceUrl, sourceDomain, trustedProviderUrl } from "./url-policy.js";

function positiveNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function stripHtml(value) {
  return String(value || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+\n/g, "\n")
    .replace(/\n\s+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function firstString(...values) {
  return values.map((value) => String(value || "").trim()).find(Boolean) || "";
}

function arrayOfStrings(value, fallback = []) {
  if (!Array.isArray(value)) return fallback;
  const normalized = value.map((item) => String(item || "").trim()).filter(Boolean);
  return normalized.length ? normalized : fallback;
}

function normalizeHandle(raw) {
  const handle = firstString(
    raw.author?.handle,
    raw.author?.username,
    raw.account?.acct,
    raw.account?.username,
    raw.username
  );
  return handle.startsWith("@") ? handle : `@${handle || "approved_source"}`;
}

function normalizePreview(raw, sourceUrl, env = process.env) {
  const card = raw.card || raw.linkPreview || raw.preview || {};
  const image = safeImageUrl(firstString(card.image, card.imageUrl, raw.media?.[0]?.url, DEFAULT_IMAGE), { env });
  const title = firstString(card.title, raw.linkTitle, "Partner source");
  const description = firstString(card.description, raw.linkDescription, "Approved partner feed item.");

  let domain = firstString(card.providerName, card.domain, "partner.source");
  if (sourceUrl && sourceUrl !== "#") domain = sourceDomain(sourceUrl, firstString(card.domain, domain));

  return {
    domain,
    title,
    description,
    image
  };
}

export function normalizePartnerPost(raw, index = 0, { env = process.env } = {}) {
  const id = firstString(raw.id, raw.statusId, raw.status_id, raw.uri, `partner-${index + 1}`);
  const author = normalizeHandle(raw);
  const title = firstString(raw.author?.displayName, raw.author?.display_name, raw.account?.display_name, raw.account?.displayName, raw.authorName, author);
  const sourceText = stripHtml(firstString(raw.text, raw.content, raw.body, raw.plainText, "Partner post pending text."));
  const sourceUrl = safeSourceUrl(firstString(raw.url, raw.uri, raw.link, raw.permalink, "#"), { env });
  const summary = firstString(raw.summary, raw.ai?.summary, sourceText.slice(0, 180));
  const countryCodes = arrayOfStrings(raw.countryCodes || raw.country_codes || raw.metadata?.countryCodes, ["WORLD"]);
  const impact = raw.countryImpact || raw.country_impact || raw.metadata?.countryImpact || {
    WORLD: firstString(raw.impact, raw.metadata?.impact, "Partner post requires local country-impact analysis.")
  };
  const verificationStatus = firstString(raw.verificationStatus, raw.verification_status, raw.metadata?.verificationStatus, "Partner feed source; not independently verified by Truth World.");

  return {
    id: `partner-${id}`,
    title,
    author,
    publishedAt: firstString(raw.publishedAt, raw.published_at, raw.createdAt, raw.created_at, new Date().toISOString()),
    hourSlot: firstString(raw.hourSlot, raw.hour_slot, ""),
    countryCodes,
    impactLevel: firstString(raw.impactLevel, raw.impact_level, raw.metadata?.impactLevel, "Watch"),
    sourceTier: firstString(raw.sourceTier, raw.source_tier, "Truth partner watchlist"),
    sourceStatus: firstString(raw.sourceStatus, raw.source_status, "Approved partner feed"),
    sourceUrl,
    linkPreview: normalizePreview(raw, sourceUrl, env),
    sourceText,
    countryImpact: impact,
    verificationStatus,
    tags: arrayOfStrings(raw.tags || raw.hashtags, ["truth_partner_api"]),
    ai: {
      ko: {
        summary,
        translation: firstString(raw.translation, raw.ai?.translation, sourceText),
        claims: arrayOfStrings(raw.claims || raw.ai?.claims, [summary])
      }
    }
  };
}

export function normalizePartnerFeedPayload(payload, manualSeed = {}, { env = process.env } = {}) {
  const maxItems = Math.floor(positiveNumber(env.TRUTH_SOCIAL_PARTNER_FEED_MAX_ITEMS, 100));
  const partnerItems = payload?.posts || payload?.statuses || payload?.items || [];
  const posts = Array.isArray(partnerItems)
    ? partnerItems.slice(0, maxItems).map((item, index) => normalizePartnerPost(item, index, { env }))
    : [];

  return {
    ...manualSeed,
    watchlist: {
      ...(manualSeed.watchlist || {}),
      status: "Partner API connected",
      policy: "Approved Truth Social partner feed active. No crawler is used."
    },
    posts,
    provider: {
      sourceProvider: "truth_partner_api",
      live: true,
      itemCount: posts.length
    }
  };
}

async function readBoundedJson(response, { maxBytes }) {
  if (response.body && typeof response.body.getReader === "function") {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let text = "";
    let bytes = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength || value.length || 0;
      if (bytes > maxBytes) {
        const err = new Error("Truth partner feed response is too large.");
        err.status = 502;
        err.code = "TRUTH_PARTNER_RESPONSE_TOO_LARGE";
        throw err;
      }
      text += decoder.decode(value, { stream: true });
    }

    text += decoder.decode();
    return JSON.parse(text || "{}");
  }

  const text = typeof response.text === "function"
    ? await response.text()
    : JSON.stringify(await response.json());
  if (Buffer.byteLength(text, "utf8") > maxBytes) {
    const err = new Error("Truth partner feed response is too large.");
    err.status = 502;
    err.code = "TRUTH_PARTNER_RESPONSE_TOO_LARGE";
    throw err;
  }
  return JSON.parse(text || "{}");
}

export async function fetchTruthPartnerFeed({
  env = process.env,
  fetchImpl = globalThis.fetch,
  manualSeed = {}
} = {}) {
  const apiBase = String(env.TRUTH_SOCIAL_PARTNER_API_BASE || "").trim();
  const apiKey = String(env.TRUTH_SOCIAL_PARTNER_API_KEY || "").trim();
  const feedPath = String(env.TRUTH_SOCIAL_PARTNER_FEED_PATH || "/feed").trim();
  const watchlistId = String(env.TRUTH_SOCIAL_WATCHLIST_ID || "default_watchlist_98").trim();

  if (!apiBase || !apiKey) {
    const err = new Error("Truth Social partner feed credentials are not configured.");
    err.status = 503;
    err.code = "TRUTH_PARTNER_NOT_CONFIGURED";
    throw err;
  }

  if (typeof fetchImpl !== "function") {
    const err = new Error("fetch is not available in this Node runtime.");
    err.status = 500;
    err.code = "FETCH_UNAVAILABLE";
    throw err;
  }

  const apiBaseUrl = trustedProviderUrl(apiBase.endsWith("/") ? apiBase : `${apiBase}/`, {
    env,
    label: "Truth Social partner API base"
  });
  const endpoint = new URL(feedPath, apiBaseUrl);
  endpoint.searchParams.set("watchlistId", watchlistId);
  endpoint.searchParams.set("limit", String(env.TRUTH_SOCIAL_PARTNER_FEED_LIMIT || 100));
  const timeoutMs = positiveNumber(env.TRUTH_SOCIAL_PARTNER_TIMEOUT_MS, 8000);
  const maxBytes = positiveNumber(env.TRUTH_SOCIAL_PARTNER_MAX_RESPONSE_BYTES, 1_000_000);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(endpoint, {
      signal: controller.signal,
      headers: {
        accept: "application/json",
        authorization: `Bearer ${apiKey}`
      }
    });

    if (!response.ok) {
      const err = new Error(`Truth partner feed request failed with ${response.status}.`);
      err.status = 502;
      err.code = "TRUTH_PARTNER_REQUEST_FAILED";
      throw err;
    }

    return normalizePartnerFeedPayload(await readBoundedJson(response, { maxBytes }), manualSeed, { env });
  } catch (error) {
    if (error.name === "AbortError") {
      const err = new Error("Truth partner feed request timed out.");
      err.status = 504;
      err.code = "TRUTH_PARTNER_TIMEOUT";
      throw err;
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
