import assert from "node:assert/strict";
import test from "node:test";

import {
  buildGrokMessages,
  buildTranslationMessages,
  extractResponseText,
  normalizeSummaryPayload,
  normalizeTranslationPayload,
  parseModelJson,
  summarizeWithGrok,
  translateWithGrok
} from "../src/grok.js";

test("buildGrokMessages asks for transparent JSON analysis", () => {
  const messages = buildGrokMessages({
    text: "A long enough source text for analysis.",
    targetLanguage: "ko",
    sourceUrl: "https://truthsocial.com/example"
  });

  assert.equal(messages[0].role, "system");
  assert.match(messages[0].content, /Return JSON only/);
  assert.match(messages[1].content, /Target language: ko/);
  assert.match(messages[1].content, /https:\/\/truthsocial\.com\/example/);
});

test("parseModelJson accepts fenced JSON", () => {
  const parsed = parseModelJson('```json\n{"summary":"s","translation":"t","claims":["c"],"verificationStatus":"Not independently verified"}\n```');
  assert.deepEqual(parsed.claims, ["c"]);
});

test("normalizeSummaryPayload keeps a safe verification fallback", () => {
  const normalized = normalizeSummaryPayload({ summary: " s ", translation: " t ", claims: [" c ", ""] }, "grok-test");
  assert.deepEqual(normalized, {
    summary: "s",
    translation: "t",
    claims: ["c"],
    verificationStatus: "Not independently verified",
    model: "grok-test"
  });
});

test("extractResponseText reads Responses API output_text parts", () => {
  const text = extractResponseText({
    output: [
      {
        type: "message",
        content: [
          {
            type: "output_text",
            text: "{\"summary\":\"s\",\"translation\":\"t\",\"claims\":[],\"verificationStatus\":\"Not independently verified\"}"
          }
        ]
      }
    ]
  });

  assert.match(text, /"summary":"s"/);
});

test("summarizeWithGrok fails clearly without XAI_API_KEY", async () => {
  await assert.rejects(
    summarizeWithGrok({
      text: "This source text is long enough to satisfy validation.",
      apiKey: "",
      fetchImpl: async () => {
        throw new Error("should not call fetch");
      }
    }),
    { code: "MISSING_XAI_API_KEY", status: 503 }
  );
});

test("summarizeWithGrok calls xAI Responses API without exposing browser secrets", async () => {
  let request;
  const result = await summarizeWithGrok({
    text: "This source text is long enough to send to Grok for a summary.",
    targetLanguage: "ko",
    sourceUrl: "https://truthsocial.com/example",
    apiKey: "test-key",
    model: "grok-test",
    fetchImpl: async (url, options) => {
      request = { url, options };
      return {
        ok: true,
        async json() {
          return {
            model: "grok-test",
            output: [
              {
                type: "message",
                content: [
                  {
                    type: "output_text",
                    text: JSON.stringify({
                      summary: "요약",
                      translation: "번역",
                      claims: ["주장"],
                      verificationStatus: "Not independently verified"
                    })
                  }
                ]
              }
            ]
          };
        }
      };
    }
  });

  assert.equal(request.url, "https://api.x.ai/v1/responses");
  assert.equal(request.options.headers.authorization, "Bearer test-key");
  assert.equal(JSON.parse(request.options.body).model, "grok-test");
  assert.equal(JSON.parse(request.options.body).store, false);
  assert.equal(result.summary, "요약");
  assert.equal(result.claims[0], "주장");
});

test("buildTranslationMessages asks for JSON-only field translation", () => {
  const messages = buildTranslationMessages({
    targetLanguage: "Chinese",
    items: [
      {
        id: "truth:WORLD:p1",
        type: "truth_post",
        fields: {
          title: "Global Truth Brief",
          claims: ["Preserve this claim shape"]
        }
      }
    ]
  });

  assert.equal(messages[0].role, "system");
  assert.match(messages[0].content, /Translate field values only/);
  assert.match(messages[0].content, /Return JSON only/);
  assert.match(messages[1].content, /Target language: Chinese/);
  const payload = JSON.parse(messages[1].content.split("\n").at(-1));
  assert.equal(payload.items[0].id, "truth:WORLD:p1");
  assert.equal(payload.items[0].type, "truth_post");
  assert.deepEqual(Object.keys(payload.items[0].fields), ["title", "claims"]);
});

test("normalizeTranslationPayload preserves ids and falls back missing fields", () => {
  const normalized = normalizeTranslationPayload(
    {
      items: [
        {
          id: "ui:chrome",
          fields: {
            title: "标题",
            labels: ["一", ""]
          }
        }
      ]
    },
    [
      {
        id: "ui:chrome",
        type: "ui_catalog",
        fields: {
          title: "Title",
          labels: ["One", "Two"],
          missing: "Fallback"
        }
      }
    ],
    "grok-test"
  );

  assert.deepEqual(normalized, {
    items: [
      {
        id: "ui:chrome",
        type: "ui_catalog",
        fields: {
          title: "标题",
          labels: ["一", "Two"],
          missing: "Fallback"
        }
      }
    ],
    model: "grok-test",
    cached: false
  });
});

test("translateWithGrok fails clearly without XAI_API_KEY", async () => {
  await assert.rejects(
    translateWithGrok({
      targetLanguage: "Chinese",
      items: [{ id: "ui:chrome", type: "ui_catalog", fields: { title: "Truth" } }],
      apiKey: "",
      fetchImpl: async () => {
        throw new Error("should not call fetch");
      }
    }),
    { code: "MISSING_XAI_API_KEY", status: 503 }
  );
});

test("translateWithGrok calls xAI Responses API and parses translated fields", async () => {
  let request;
  const result = await translateWithGrok({
    targetLanguage: "Chinese",
    items: [
      {
        id: "news:global",
        type: "news_bundle",
        fields: {
          title: "Global Truth Brief",
          includes: ["Truth watchlist", "Global topics"]
        }
      }
    ],
    apiKey: "test-key",
    model: "grok-test",
    fetchImpl: async (url, options) => {
      request = { url, options };
      return {
        ok: true,
        async json() {
          return {
            model: "grok-test",
            output_text: JSON.stringify({
              items: [
                {
                  id: "news:global",
                  type: "news_bundle",
                  fields: {
                    title: "全球真相简报",
                    includes: ["Truth 观察列表", "全球话题"]
                  }
                }
              ]
            })
          };
        }
      };
    }
  });

  const body = JSON.parse(request.options.body);
  assert.equal(request.url, "https://api.x.ai/v1/responses");
  assert.equal(request.options.headers.authorization, "Bearer test-key");
  assert.equal(body.model, "grok-test");
  assert.equal(body.store, false);
  assert.equal(result.items[0].fields.title, "全球真相简报");
  assert.deepEqual(result.items[0].fields.includes, ["Truth 观察列表", "全球话题"]);
});
