export const DEFAULT_XAI_MODEL = "grok-4.3";
const DEFAULT_XAI_API_BASE = "https://api.x.ai/v1";

const systemPrompt = `You power Truth World, a public-interest reader for source-linked social posts.
Return neutral, faithful analysis only.
Do not endorse, intensify, or soften the source.
Separate what the source says from what has been independently verified.
If verification evidence is not provided, verificationStatus must be "Not independently verified".
Return JSON only with these fields:
summary: string
translation: string
claims: array of strings
verificationStatus: string`;

const translationSystemPrompt = `You power Truth World's multilingual reader.
Translate interface and feed text faithfully into the target language.
Preserve item ids, item types, field names, array order, URLs, handles, hashtags, numbers, timestamps, product names, and source names.
Translate field values only.
Do not summarize, add context, remove claims, or change the political meaning.
Return JSON only in this exact shape:
{"items":[{"id":"string","type":"string","fields":{"fieldName":"translated string or array"}}]}`;

export function buildGrokMessages({ text, targetLanguage = "ko", sourceUrl = "" }) {
  return [
    {
      role: "system",
      content: systemPrompt
    },
    {
      role: "user",
      content: [
        `Target language: ${targetLanguage}`,
        `Source URL: ${sourceUrl || "not provided"}`,
        "Source text:",
        text
      ].join("\n")
    }
  ];
}

export function normalizeTranslationRequestItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    const err = new Error("items must be a non-empty array.");
    err.status = 400;
    err.code = "INVALID_TRANSLATION_ITEMS";
    throw err;
  }

  if (items.length > 40) {
    const err = new Error("items cannot contain more than 40 entries.");
    err.status = 400;
    err.code = "TRANSLATION_BATCH_TOO_LARGE";
    throw err;
  }

  return items.map((item, index) => {
    const id = String(item?.id || "").trim();
    const type = String(item?.type || "text").trim();
    const fields = item?.fields;

    if (!id) {
      const err = new Error(`items[${index}].id is required.`);
      err.status = 400;
      err.code = "INVALID_TRANSLATION_ITEM_ID";
      throw err;
    }

    if (!fields || typeof fields !== "object" || Array.isArray(fields)) {
      const err = new Error(`items[${index}].fields must be an object.`);
      err.status = 400;
      err.code = "INVALID_TRANSLATION_FIELDS";
      throw err;
    }

    const normalizedFields = {};
    for (const [fieldName, value] of Object.entries(fields)) {
      if (!fieldName) continue;
      if (Array.isArray(value)) {
        const values = value.map((entry) => String(entry || "").trim()).filter(Boolean);
        if (values.length) normalizedFields[fieldName] = values;
        continue;
      }
      const text = String(value || "").trim();
      if (text) normalizedFields[fieldName] = text;
    }

    if (Object.keys(normalizedFields).length === 0) {
      const err = new Error(`items[${index}].fields must include at least one text field.`);
      err.status = 400;
      err.code = "EMPTY_TRANSLATION_FIELDS";
      throw err;
    }

    return { id, type, fields: normalizedFields };
  });
}

export function buildTranslationMessages({ targetLanguage, items }) {
  if (!targetLanguage || typeof targetLanguage !== "string") {
    const err = new Error("targetLanguage must be a string.");
    err.status = 400;
    err.code = "INVALID_TARGET_LANGUAGE";
    throw err;
  }

  const normalizedItems = normalizeTranslationRequestItems(items);

  return [
    {
      role: "system",
      content: translationSystemPrompt
    },
    {
      role: "user",
      content: [
        `Target language: ${targetLanguage}`,
        "Translate this JSON payload. Return JSON only.",
        JSON.stringify({ items: normalizedItems })
      ].join("\n")
    }
  ];
}

export function normalizeSummaryPayload(payload, model = DEFAULT_XAI_MODEL) {
  const claims = Array.isArray(payload.claims)
    ? payload.claims.map((claim) => String(claim).trim()).filter(Boolean)
    : [];

  return {
    summary: String(payload.summary || "").trim(),
    translation: String(payload.translation || "").trim(),
    claims,
    verificationStatus: String(payload.verificationStatus || "Not independently verified").trim(),
    model
  };
}

function normalizeTranslatedFields(translatedFields, originalFields) {
  const fields = {};
  for (const [fieldName, fallbackValue] of Object.entries(originalFields || {})) {
    const value = translatedFields?.[fieldName];

    if (Array.isArray(fallbackValue)) {
      fields[fieldName] = Array.isArray(value) && value.length === fallbackValue.length
        ? value.map((entry, index) => String(entry || "").trim() || fallbackValue[index] || "")
        : fallbackValue;
      continue;
    }

    fields[fieldName] = typeof value === "string" && value.trim()
      ? value.trim()
      : String(fallbackValue || "").trim();
  }
  return fields;
}

export function normalizeTranslationPayload(payload, originalItems = [], model = DEFAULT_XAI_MODEL) {
  const translatedItems = Array.isArray(payload?.items) ? payload.items : [];
  const translatedById = new Map(translatedItems.map((item) => [String(item?.id || ""), item]));

  return {
    items: originalItems.map((original) => {
      const translated = translatedById.get(original.id) || {};
      return {
        id: original.id,
        type: original.type,
        fields: normalizeTranslatedFields(translated.fields, original.fields)
      };
    }),
    model,
    cached: false
  };
}

export function parseModelJson(content) {
  if (typeof content !== "string") {
    throw new Error("Model response content was not text.");
  }

  const trimmed = content.trim();
  const fencedMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  const jsonText = fencedMatch ? fencedMatch[1] : trimmed;

  try {
    return JSON.parse(jsonText);
  } catch {
    const err = new Error("Grok response was not valid JSON.");
    err.status = 502;
    err.code = "INVALID_MODEL_JSON";
    err.publicMessage = "The AI response could not be parsed. Try again.";
    throw err;
  }
}

export function extractResponseText(data) {
  if (typeof data?.output_text === "string") {
    return data.output_text;
  }

  if (Array.isArray(data?.output)) {
    for (const output of data.output) {
      if (!Array.isArray(output?.content)) continue;
      const textPart = output.content.find((part) => part?.type === "output_text" && typeof part.text === "string");
      if (textPart) return textPart.text;
    }
  }

  const chatCompletionContent = data?.choices?.[0]?.message?.content;
  if (typeof chatCompletionContent === "string") {
    return chatCompletionContent;
  }

  const err = new Error("Grok response did not include text output.");
  err.status = 502;
  err.code = "MISSING_MODEL_TEXT";
  err.publicMessage = "The AI response did not include usable text. Try again.";
  throw err;
}

function validateInput({ text, targetLanguage }) {
  if (!text || typeof text !== "string" || text.trim().length < 20) {
    const err = new Error("Text must contain at least 20 characters.");
    err.status = 400;
    err.code = "INVALID_TEXT";
    throw err;
  }

  if (targetLanguage && typeof targetLanguage !== "string") {
    const err = new Error("targetLanguage must be a string.");
    err.status = 400;
    err.code = "INVALID_TARGET_LANGUAGE";
    throw err;
  }
}

function validateTranslationInput({ targetLanguage, items }) {
  if (!targetLanguage || typeof targetLanguage !== "string") {
    const err = new Error("targetLanguage must be a string.");
    err.status = 400;
    err.code = "INVALID_TARGET_LANGUAGE";
    throw err;
  }

  return normalizeTranslationRequestItems(items);
}

export async function summarizeWithGrok({
  text,
  targetLanguage = "ko",
  sourceUrl = "",
  apiKey = process.env.XAI_API_KEY,
  model = process.env.XAI_MODEL || DEFAULT_XAI_MODEL,
  apiBase = process.env.XAI_API_BASE || DEFAULT_XAI_API_BASE,
  fetchImpl = globalThis.fetch
}) {
  validateInput({ text, targetLanguage });

  if (!apiKey) {
    const err = new Error("XAI_API_KEY is required to call Grok.");
    err.status = 503;
    err.code = "MISSING_XAI_API_KEY";
    err.publicMessage = "Grok is not configured on this server. Set XAI_API_KEY and restart.";
    throw err;
  }

  if (typeof fetchImpl !== "function") {
    const err = new Error("fetch is not available in this Node runtime.");
    err.status = 500;
    err.code = "FETCH_UNAVAILABLE";
    throw err;
  }

  const endpoint = `${apiBase.replace(/\/$/, "")}/responses`;
  const response = await fetchImpl(endpoint, {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model,
      input: buildGrokMessages({ text, targetLanguage, sourceUrl }),
      store: false
    })
  });

  if (!response.ok) {
    let detail = "";
    try {
      detail = await response.text();
    } catch {
      detail = response.statusText;
    }
    const err = new Error(`xAI API request failed with ${response.status}: ${detail}`);
    err.status = response.status >= 400 && response.status < 500 ? 502 : response.status;
    err.code = "XAI_REQUEST_FAILED";
    err.publicMessage = "Grok could not summarize this post right now.";
    throw err;
  }

  const data = await response.json();
  const content = extractResponseText(data);
  const parsed = parseModelJson(content);
  return normalizeSummaryPayload(parsed, data?.model || model);
}

export async function translateWithGrok({
  targetLanguage,
  items,
  apiKey = process.env.XAI_API_KEY,
  model = process.env.XAI_MODEL || DEFAULT_XAI_MODEL,
  apiBase = process.env.XAI_API_BASE || DEFAULT_XAI_API_BASE,
  fetchImpl = globalThis.fetch
}) {
  const normalizedItems = validateTranslationInput({ targetLanguage, items });

  if (!apiKey) {
    const err = new Error("XAI_API_KEY is required to translate with Grok.");
    err.status = 503;
    err.code = "MISSING_XAI_API_KEY";
    err.publicMessage = "Translation is not configured on this server. Set XAI_API_KEY and restart.";
    throw err;
  }

  if (typeof fetchImpl !== "function") {
    const err = new Error("fetch is not available in this Node runtime.");
    err.status = 500;
    err.code = "FETCH_UNAVAILABLE";
    throw err;
  }

  const endpoint = `${apiBase.replace(/\/$/, "")}/responses`;
  const response = await fetchImpl(endpoint, {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model,
      input: buildTranslationMessages({ targetLanguage, items: normalizedItems }),
      store: false
    })
  });

  if (!response.ok) {
    let detail = "";
    try {
      detail = await response.text();
    } catch {
      detail = response.statusText;
    }
    const err = new Error(`xAI API request failed with ${response.status}: ${detail}`);
    err.status = response.status >= 400 && response.status < 500 ? 502 : response.status;
    err.code = "XAI_REQUEST_FAILED";
    err.publicMessage = "Grok could not translate this screen right now.";
    throw err;
  }

  const data = await response.json();
  const content = extractResponseText(data);
  const parsed = parseModelJson(content);
  return normalizeTranslationPayload(parsed, normalizedItems, data?.model || model);
}
