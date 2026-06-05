import { isProductionEnv } from "./security-policy.js";
import { trustedProviderUrl } from "./url-policy.js";

export const DEV_PHONE_CODE = "000000";

export function normalizeCountryCode(countryCode) {
  const normalized = String(countryCode || "").trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(normalized)) {
    const err = new Error("Choose a valid two-letter country code.");
    err.status = 400;
    err.code = "INVALID_COUNTRY_CODE";
    throw err;
  }
  return normalized;
}

export function normalizePhoneNumber(phoneNumber) {
  const normalized = String(phoneNumber || "").replace(/[\s().-]/g, "");
  if (!/^\+[1-9]\d{7,14}$/.test(normalized)) {
    const err = new Error("Enter a valid international phone number, for example +821012345678.");
    err.status = 400;
    err.code = "INVALID_PHONE_NUMBER";
    throw err;
  }
  return normalized;
}

export function phoneVerificationMode(env = process.env) {
  const configured = String(env.TRUTH_WORLD_PHONE_VERIFICATION_MODE || "").trim().toLowerCase();
  if (configured) return configured;
  return isProductionEnv(env) ? "unconfigured" : "dev_auto";
}

export function canAutoVerifyPhone(env = process.env) {
  return phoneVerificationMode(env) === "dev_auto" && !isProductionEnv(env);
}

export function publicPhoneVerificationStatus(user) {
  const verification = user?.phoneVerification || {};
  return {
    phoneNumber: verification.phoneNumber || "",
    countryCode: verification.countryCode || "",
    status: verification.status || "missing",
    verifiedAt: verification.verifiedAt || "",
    provider: verification.provider || ""
  };
}

export function writeEligibilityFromVerification(verification = {}) {
  return Boolean(
    verification.status === "verified"
    && verification.verifiedAt
    && /^[A-Z]{2}$/.test(String(verification.countryCode || ""))
    && /^\+[1-9]\d{7,14}$/.test(String(verification.phoneNumber || ""))
  );
}

function requireProviderConfig(env, names) {
  const missing = names.filter((name) => !String(env[name] || "").trim());
  if (missing.length) {
    const err = new Error(`Phone verification provider is missing ${missing.join(", ")}.`);
    err.status = 503;
    err.code = "PHONE_VERIFICATION_NOT_CONFIGURED";
    throw err;
  }
}

async function parseJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

export async function startPhoneVerification({ phoneNumber, countryCode, env = process.env, fetchImpl = globalThis.fetch } = {}) {
  const normalizedPhone = normalizePhoneNumber(phoneNumber);
  const normalizedCountry = normalizeCountryCode(countryCode);
  const mode = phoneVerificationMode(env);

  if (mode === "dev_auto" || mode === "dev_code") {
    if (isProductionEnv(env)) {
      const err = new Error("Development phone verification is not allowed in production.");
      err.status = 503;
      err.code = "PHONE_VERIFICATION_DEV_MODE_BLOCKED";
      throw err;
    }
    return {
      provider: mode,
      challengeId: `dev-${Date.now()}`,
      countryCode: normalizedCountry,
      phoneNumber: normalizedPhone,
      developmentCode: mode === "dev_code" ? String(env.TRUTH_WORLD_DEV_PHONE_CODE || DEV_PHONE_CODE) : ""
    };
  }

  if (mode === "external") {
    requireProviderConfig(env, ["TRUTH_WORLD_PHONE_VERIFY_START_URL", "TRUTH_WORLD_PHONE_VERIFY_API_KEY"]);
    const endpoint = trustedProviderUrl(env.TRUTH_WORLD_PHONE_VERIFY_START_URL, {
      env,
      label: "Phone verification start URL"
    });
    const response = await fetchImpl(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${env.TRUTH_WORLD_PHONE_VERIFY_API_KEY}`
      },
      body: JSON.stringify({ phoneNumber: normalizedPhone, countryCode: normalizedCountry })
    });
    const payload = await parseJson(response);
    if (!response.ok) {
      const err = new Error("Phone verification provider failed to start verification.");
      err.status = 502;
      err.code = "PHONE_VERIFICATION_START_FAILED";
      throw err;
    }
    return {
      provider: "external",
      challengeId: String(payload.challengeId || payload.sid || ""),
      countryCode: normalizedCountry,
      phoneNumber: normalizedPhone
    };
  }

  if (mode === "twilio") {
    requireProviderConfig(env, ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_VERIFY_SERVICE_SID"]);
    const endpoint = `https://verify.twilio.com/v2/Services/${encodeURIComponent(env.TWILIO_VERIFY_SERVICE_SID)}/Verifications`;
    const body = new URLSearchParams({ To: normalizedPhone, Channel: "sms" });
    const auth = Buffer.from(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`).toString("base64");
    const response = await fetchImpl(endpoint, {
      method: "POST",
      headers: {
        authorization: `Basic ${auth}`,
        "content-type": "application/x-www-form-urlencoded"
      },
      body
    });
    const payload = await parseJson(response);
    if (!response.ok) {
      const err = new Error("Twilio Verify failed to start verification.");
      err.status = 502;
      err.code = "PHONE_VERIFICATION_START_FAILED";
      throw err;
    }
    return {
      provider: "twilio",
      challengeId: String(payload.sid || ""),
      countryCode: normalizedCountry,
      phoneNumber: normalizedPhone
    };
  }

  const err = new Error("Phone verification provider is not configured.");
  err.status = 503;
  err.code = "PHONE_VERIFICATION_NOT_CONFIGURED";
  throw err;
}

export async function checkPhoneVerification({ phoneNumber, countryCode, code, env = process.env, fetchImpl = globalThis.fetch } = {}) {
  const normalizedPhone = normalizePhoneNumber(phoneNumber);
  const normalizedCountry = normalizeCountryCode(countryCode);
  const mode = phoneVerificationMode(env);
  const submittedCode = String(code || "").trim();

  if (mode === "dev_auto") {
    if (isProductionEnv(env)) {
      const err = new Error("Development phone verification is not allowed in production.");
      err.status = 503;
      err.code = "PHONE_VERIFICATION_DEV_MODE_BLOCKED";
      throw err;
    }
    return { approved: true, provider: mode, countryCode: normalizedCountry, phoneNumber: normalizedPhone };
  }

  if (mode === "dev_code") {
    if (isProductionEnv(env)) {
      const err = new Error("Development phone verification is not allowed in production.");
      err.status = 503;
      err.code = "PHONE_VERIFICATION_DEV_MODE_BLOCKED";
      throw err;
    }
    return {
      approved: submittedCode === String(env.TRUTH_WORLD_DEV_PHONE_CODE || DEV_PHONE_CODE),
      provider: mode,
      countryCode: normalizedCountry,
      phoneNumber: normalizedPhone
    };
  }

  if (mode === "external") {
    requireProviderConfig(env, ["TRUTH_WORLD_PHONE_VERIFY_CHECK_URL", "TRUTH_WORLD_PHONE_VERIFY_API_KEY"]);
    const endpoint = trustedProviderUrl(env.TRUTH_WORLD_PHONE_VERIFY_CHECK_URL, {
      env,
      label: "Phone verification check URL"
    });
    const response = await fetchImpl(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${env.TRUTH_WORLD_PHONE_VERIFY_API_KEY}`
      },
      body: JSON.stringify({ phoneNumber: normalizedPhone, countryCode: normalizedCountry, code: submittedCode })
    });
    const payload = await parseJson(response);
    if (!response.ok) {
      const err = new Error("Phone verification provider failed to check verification.");
      err.status = 502;
      err.code = "PHONE_VERIFICATION_CHECK_FAILED";
      throw err;
    }
    return {
      approved: Boolean(payload.approved || payload.status === "approved"),
      provider: "external",
      countryCode: normalizedCountry,
      phoneNumber: normalizedPhone
    };
  }

  if (mode === "twilio") {
    requireProviderConfig(env, ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_VERIFY_SERVICE_SID"]);
    const endpoint = `https://verify.twilio.com/v2/Services/${encodeURIComponent(env.TWILIO_VERIFY_SERVICE_SID)}/VerificationCheck`;
    const body = new URLSearchParams({ To: normalizedPhone, Code: submittedCode });
    const auth = Buffer.from(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`).toString("base64");
    const response = await fetchImpl(endpoint, {
      method: "POST",
      headers: {
        authorization: `Basic ${auth}`,
        "content-type": "application/x-www-form-urlencoded"
      },
      body
    });
    const payload = await parseJson(response);
    if (!response.ok) {
      const err = new Error("Twilio Verify failed to check verification.");
      err.status = 502;
      err.code = "PHONE_VERIFICATION_CHECK_FAILED";
      throw err;
    }
    return {
      approved: payload.status === "approved",
      provider: "twilio",
      countryCode: normalizedCountry,
      phoneNumber: normalizedPhone
    };
  }

  const err = new Error("Phone verification provider is not configured.");
  err.status = 503;
  err.code = "PHONE_VERIFICATION_NOT_CONFIGURED";
  throw err;
}
