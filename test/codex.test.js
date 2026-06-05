import assert from "node:assert/strict";
import test from "node:test";

import {
  buildCodexTranslationPrompt,
  buildCodexChildEnv,
  codexCliEnabled,
  translateWithCodex
} from "../src/codex-cli.js";

test("buildCodexTranslationPrompt forbids tools and asks for JSON only", () => {
  const prompt = buildCodexTranslationPrompt({
    targetLanguage: "Korean",
    items: [{ id: "ui:chrome", type: "ui_catalog", fields: { title: "Truth" } }]
  });

  assert.match(prompt, /Do not use tools/);
  assert.match(prompt, /Return only the requested JSON object/);
  assert.match(prompt, /Target language: Korean/);
  assert.match(prompt, /"id":"ui:chrome"/);
});

test("translateWithCodex parses final JSON and preserves original fields", async () => {
  let prompt;
  const result = await translateWithCodex({
    targetLanguage: "Korean",
    items: [
      {
        id: "topic:one",
        type: "topic_card",
        fields: {
          title: "Security topic",
          labels: ["Open room", "Sign in"]
        }
      }
    ],
    model: "codex-test",
    runCodex: async (input) => {
      prompt = input;
      return JSON.stringify({
        items: [
          {
            id: "topic:one",
            type: "topic_card",
            fields: {
              title: "안보 토픽",
              labels: ["방 열기", "로그인"]
            }
          }
        ]
      });
    }
  });

  assert.match(prompt, /Security topic/);
  assert.equal(result.model, "codex:codex-test");
  assert.equal(result.items[0].fields.title, "안보 토픽");
  assert.deepEqual(result.items[0].fields.labels, ["방 열기", "로그인"]);
});

test("codexCliEnabled can be disabled by env", () => {
  assert.equal(codexCliEnabled({ CODEX_TRANSLATION_DISABLED: "1" }), false);
  assert.equal(codexCliEnabled({ CODEX_TRANSLATION_PROVIDER: "disabled" }), false);
});

test("codexCliEnabled is blocked by default in production", () => {
  assert.equal(codexCliEnabled({ NODE_ENV: "production" }), false);
  assert.equal(codexCliEnabled({
    NODE_ENV: "production",
    TRUTH_WORLD_ALLOW_CODEX_TRANSLATION_IN_PRODUCTION: "1"
  }), true);
});

test("buildCodexChildEnv strips provider secrets from Codex fallback", () => {
  const childEnv = buildCodexChildEnv({
    PATH: "/bin",
    HOME: "/tmp/home",
    XAI_API_KEY: "xai-secret",
    TRUTH_SOCIAL_PARTNER_API_KEY: "truth-secret",
    TWILIO_AUTH_TOKEN: "twilio-secret",
    TRUTH_WORLD_PHONE_VERIFY_API_KEY: "phone-secret"
  });

  assert.equal(childEnv.PATH, "/bin");
  assert.equal(childEnv.HOME, "/tmp/home");
  assert.equal(childEnv.NO_COLOR, "1");
  assert.equal(childEnv.XAI_API_KEY, undefined);
  assert.equal(childEnv.TRUTH_SOCIAL_PARTNER_API_KEY, undefined);
  assert.equal(childEnv.TWILIO_AUTH_TOKEN, undefined);
  assert.equal(childEnv.TRUTH_WORLD_PHONE_VERIFY_API_KEY, undefined);
});
