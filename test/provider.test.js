import assert from "node:assert/strict";
import test from "node:test";

import { buildReadinessStatus } from "../src/readiness.js";
import { startPhoneVerification } from "../src/phone-verification.js";
import { fetchTruthPartnerFeed, normalizePartnerFeedPayload, normalizePartnerPost } from "../src/truth-partner.js";

test("buildReadinessStatus reports missing credentials without leaking values", () => {
  const readiness = buildReadinessStatus({
    TRUTH_SOCIAL_PARTNER_API_KEY: "secret-feed-key",
    XAI_API_KEY: "secret-grok-key"
  });

  assert.equal(readiness.ok, false);
  assert.equal(readiness.sourceProvider, "manual_seed");
  assert.deepEqual(readiness.providers.truthPartner.missingEnv, ["TRUTH_SOCIAL_PARTNER_API_BASE"]);
  assert.deepEqual(readiness.providers.grok.missingEnv, []);
  assert.doesNotMatch(JSON.stringify(readiness), /secret-feed-key|secret-grok-key/);
});

test("buildReadinessStatus marks partner and Grok providers ready when env is complete", () => {
  const readiness = buildReadinessStatus({
    TRUTH_SOCIAL_PARTNER_API_BASE: "https://partner.example",
    TRUTH_SOCIAL_PARTNER_API_KEY: "secret-feed-key",
    XAI_API_KEY: "secret-grok-key",
    XAI_MODEL: "grok-test"
  });

  assert.equal(readiness.ok, true);
  assert.equal(readiness.readOk, true);
  assert.equal(readiness.writeOk, true);
  assert.equal(readiness.sourceProvider, "truth_partner_api");
  assert.equal(readiness.providers.truthPartner.configured, true);
  assert.equal(readiness.providers.grok.model, "grok-test");
  assert.equal(readiness.providers.copilot.provider, "grok");
});

test("buildReadinessStatus can use Codex CLI as translation fallback", () => {
  const readiness = buildReadinessStatus({
    PATH: "/bin:/usr/bin",
    CODEX_TRANSLATION_COMMAND: "/bin/sh"
  });

  assert.equal(readiness.providers.codex.configured, true);
  assert.equal(readiness.providers.translation.provider, "codex_cli");
  assert.equal(readiness.providers.copilot.provider, "codex_cli");
});

test("buildReadinessStatus reports production Codex block and phone provider readiness", () => {
  const readiness = buildReadinessStatus({
    NODE_ENV: "production",
    TRUTH_WORLD_AUTH_STORE: "/var/lib/truth-world/auth.json",
    PATH: "/bin:/usr/bin",
    CODEX_TRANSLATION_COMMAND: "/bin/sh",
    TRUTH_WORLD_PHONE_VERIFICATION_MODE: "external",
    TRUTH_WORLD_PHONE_VERIFY_START_URL: "https://verify.example/start",
    TRUTH_WORLD_PHONE_VERIFY_CHECK_URL: "https://verify.example/check",
    TRUTH_WORLD_PHONE_VERIFY_API_KEY: "verify-key"
  });

  assert.equal(readiness.providers.codex.configured, false);
  assert.equal(readiness.providers.codex.blockedByPolicy, true);
  assert.equal(readiness.providers.phoneVerification.configured, true);
  assert.equal(readiness.providers.authStore.configured, true);
  assert.equal(readiness.writeOk, true);
});

test("production readiness requires auth store for write readiness", () => {
  const readiness = buildReadinessStatus({
    NODE_ENV: "production",
    TRUTH_WORLD_PHONE_VERIFICATION_MODE: "external",
    TRUTH_WORLD_PHONE_VERIFY_START_URL: "https://verify.example/start",
    TRUTH_WORLD_PHONE_VERIFY_CHECK_URL: "https://verify.example/check",
    TRUTH_WORLD_PHONE_VERIFY_API_KEY: "verify-key"
  });

  assert.equal(readiness.providers.phoneVerification.configured, true);
  assert.equal(readiness.providers.authStore.configured, false);
  assert.deepEqual(readiness.providers.authStore.missingEnv, ["TRUTH_WORLD_AUTH_STORE"]);
  assert.equal(readiness.writeOk, false);
  assert.equal(readiness.ok, false);
});

test("normalizePartnerPost maps partner-like payloads to app post schema", () => {
  const normalized = normalizePartnerPost({
    id: "123",
    account: {
      username: "WhiteHouse",
      display_name: "The White House"
    },
    created_at: "2026-06-03T12:00:00Z",
    url: "https://partner.example/statuses/123",
    content: "<p>Policy update for allies</p>",
    country_codes: ["KR", "JP"],
    metadata: {
      impactLevel: "Critical",
      countryImpact: {
        KR: "Korea impact"
      }
    },
    card: {
      title: "Source article",
      description: "Official context",
      image: "/assets/preview-policy.svg"
    },
    hashtags: ["policy", "allies"]
  });

  assert.equal(normalized.id, "partner-123");
  assert.equal(normalized.title, "The White House");
  assert.equal(normalized.author, "@WhiteHouse");
  assert.equal(normalized.sourceText, "Policy update for allies");
  assert.deepEqual(normalized.countryCodes, ["KR", "JP"]);
  assert.equal(normalized.impactLevel, "Critical");
  assert.equal(normalized.countryImpact.KR, "Korea impact");
  assert.equal(normalized.linkPreview.title, "Source article");
  assert.deepEqual(normalized.tags, ["policy", "allies"]);
});

test("normalizePartnerFeedPayload preserves manual metadata and marks live partner feed", () => {
  const normalized = normalizePartnerFeedPayload(
    {
      items: [
        {
          id: "abc",
          username: "source",
          text: "Partner text"
        }
      ]
    },
    {
      countryProfiles: { WORLD: { label: "Global" } },
      topics: [{ id: "topic" }],
      newsBundles: [{ id: "news" }],
      watchlist: { count: 98 }
    }
  );

  assert.equal(normalized.provider.sourceProvider, "truth_partner_api");
  assert.equal(normalized.provider.live, true);
  assert.equal(normalized.watchlist.status, "Partner API connected");
  assert.equal(normalized.posts.length, 1);
  assert.equal(normalized.topics.length, 1);
  assert.equal(normalized.newsBundles.length, 1);
});

test("fetchTruthPartnerFeed calls configured partner endpoint and normalizes response", async () => {
  let request;
  const normalized = await fetchTruthPartnerFeed({
    env: {
      TRUTH_SOCIAL_PARTNER_API_BASE: "https://partner.example/api",
      TRUTH_SOCIAL_PARTNER_API_KEY: "secret-feed-key",
      TRUTH_SOCIAL_PARTNER_FEED_PATH: "/v1/feed",
      TRUTH_SOCIAL_WATCHLIST_ID: "default_watchlist_98"
    },
    manualSeed: { watchlist: { count: 98 } },
    fetchImpl: async (url, options) => {
      request = { url: String(url), options };
      return {
        ok: true,
        async json() {
          return {
            posts: [
              {
                id: "live-1",
                username: "source",
                text: "Live partner post"
              }
            ]
          };
        }
      };
    }
  });

  assert.equal(request.url, "https://partner.example/v1/feed?watchlistId=default_watchlist_98&limit=100");
  assert.equal(request.options.headers.authorization, "Bearer secret-feed-key");
  assert.equal(normalized.provider.sourceProvider, "truth_partner_api");
  assert.equal(normalized.posts[0].sourceText, "Live partner post");
});

test("normalizePartnerPost rejects unsafe source and image URLs", () => {
  const normalized = normalizePartnerPost({
    id: "unsafe",
    username: "source",
    url: "javascript:alert(1)",
    text: "Unsafe link test",
    card: {
      image: "data:image/svg+xml,<svg></svg>"
    }
  });

  assert.equal(normalized.sourceUrl, "#");
  assert.equal(normalized.linkPreview.image, "/assets/preview-policy.svg");
});

test("normalizePartnerPost blocks non-allowlisted source hosts by default", () => {
  const normalized = normalizePartnerPost({
    id: "external",
    username: "source",
    url: "https://example.com/story",
    text: "External link test"
  });

  assert.equal(normalized.sourceUrl, "#");
});

test("normalizePartnerPost allows configured media hosts", () => {
  const normalized = normalizePartnerPost({
    id: "media",
    username: "source",
    url: "https://truthsocial.com/@source/posts/1",
    text: "Media link test",
    card: {
      image: "https://media.example/image.jpg"
    }
  }, 0, {
    env: {
      TRUTH_WORLD_ALLOWED_MEDIA_HOSTS: "media.example"
    }
  });

  assert.equal(normalized.sourceUrl, "https://truthsocial.com/@source/posts/1");
  assert.equal(normalized.linkPreview.image, "https://media.example/image.jpg");
});

test("production source and media URL policy rejects http and wildcard allowlists", () => {
  const httpSource = normalizePartnerPost(
    { id: "http", url: "http://truthsocial.com/@source/posts/1", text: "Unsafe http source" },
    0,
    { env: { NODE_ENV: "production" } }
  );
  assert.equal(httpSource.sourceUrl, "#");

  const wildcardSource = normalizePartnerPost(
    { id: "wild", url: "https://truthsocial.com/@source/posts/1", text: "Wildcard source" },
    0,
    { env: { NODE_ENV: "production", TRUTH_WORLD_ALLOWED_SOURCE_HOSTS: "*" } }
  );
  assert.equal(wildcardSource.sourceUrl, "#");

  const wildcardMedia = normalizePartnerPost(
    {
      id: "media",
      url: "https://truthsocial.com/@source/posts/1",
      text: "Wildcard media",
      card: { image: "https://media.example/image.jpg" }
    },
    0,
    { env: { NODE_ENV: "production", TRUTH_WORLD_ALLOWED_MEDIA_HOSTS: "*" } }
  );
  assert.equal(wildcardMedia.linkPreview.image, "/assets/preview-policy.svg");
});

test("production provider URLs must use HTTPS", async () => {
  await assert.rejects(
    fetchTruthPartnerFeed({
      env: {
        NODE_ENV: "production",
        TRUTH_SOCIAL_PARTNER_API_BASE: "http://partner.example",
        TRUTH_SOCIAL_PARTNER_API_KEY: "secret"
      },
      fetchImpl: async () => {
        throw new Error("fetch should not be called");
      }
    }),
    { code: "UNSAFE_PROVIDER_URL", status: 503 }
  );

  await assert.rejects(
    startPhoneVerification({
      phoneNumber: "+14155552671",
      countryCode: "US",
      env: {
        NODE_ENV: "production",
        TRUTH_WORLD_PHONE_VERIFICATION_MODE: "external",
        TRUTH_WORLD_PHONE_VERIFY_START_URL: "http://verify.example/start",
        TRUTH_WORLD_PHONE_VERIFY_API_KEY: "secret"
      },
      fetchImpl: async () => {
        throw new Error("fetch should not be called");
      }
    }),
    { code: "UNSAFE_PROVIDER_URL", status: 503 }
  );
});
