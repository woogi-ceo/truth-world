import { codexCliEnabled, isCodexCliAvailableSync, DEFAULT_CODEX_TRANSLATION_MODEL } from "./codex-cli.js";
import { phoneVerificationMode } from "./phone-verification.js";
import { isProductionEnv } from "./security-policy.js";

export function configuredEnv(env, names) {
  const missing = names.filter((name) => !String(env[name] || "").trim());
  return {
    configured: missing.length === 0,
    missing
  };
}

export function buildReadinessStatus(env = process.env) {
  const truthPartner = configuredEnv(env, ["TRUTH_SOCIAL_PARTNER_API_BASE", "TRUTH_SOCIAL_PARTNER_API_KEY"]);
  const grok = configuredEnv(env, ["XAI_API_KEY"]);
  const production = isProductionEnv(env);
  const authStore = production
    ? configuredEnv(env, ["TRUTH_WORLD_AUTH_STORE"])
    : { configured: true, missing: [] };
  const codexBlockedByPolicy = production && env.TRUTH_WORLD_ALLOW_CODEX_TRANSLATION_IN_PRODUCTION !== "1";
  const codexConfigured = codexCliEnabled(env) && isCodexCliAvailableSync({
    command: env.CODEX_TRANSLATION_COMMAND || "codex",
    pathValue: env.PATH || process.env.PATH || ""
  });
  const translationProvider = grok.configured ? "grok" : codexConfigured ? "codex_cli" : "local_dev";
  const phoneMode = phoneVerificationMode(env);
  const phoneProvider = phoneMode === "twilio"
    ? configuredEnv(env, ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_VERIFY_SERVICE_SID"])
    : phoneMode === "external"
      ? configuredEnv(env, ["TRUTH_WORLD_PHONE_VERIFY_START_URL", "TRUTH_WORLD_PHONE_VERIFY_CHECK_URL", "TRUTH_WORLD_PHONE_VERIFY_API_KEY"])
      : {
        configured: phoneMode === "dev_auto" && !production,
        missing: production ? ["TRUTH_WORLD_PHONE_VERIFICATION_MODE"] : []
      };
  const aiOk = grok.configured || codexConfigured;
  const readOk = truthPartner.configured && aiOk;
  const writeOk = authStore.configured && phoneProvider.configured;

  return {
    ok: readOk && writeOk,
    readOk,
    writeOk,
    aiOk,
    service: "truth-world",
    sourceProvider: truthPartner.configured ? "truth_partner_api" : "manual_seed",
    providers: {
      truthPartner: {
        configured: truthPartner.configured,
        provider: "truth_partner_api",
        status: truthPartner.configured ? "ready_for_live_feed" : "waiting_for_partner_credentials",
        missingEnv: truthPartner.missing
      },
      grok: {
        configured: grok.configured,
        provider: "grok",
        model: env.XAI_MODEL || "grok-4.3",
        status: grok.configured ? "ready_for_ai_calls" : "waiting_for_api_key",
        missingEnv: grok.missing
      },
      codex: {
        configured: codexConfigured,
        provider: "codex_cli",
        model: env.CODEX_TRANSLATION_MODEL || DEFAULT_CODEX_TRANSLATION_MODEL,
        blockedByPolicy: codexBlockedByPolicy,
        status: codexBlockedByPolicy ? "blocked_in_production" : codexConfigured ? "ready_for_translation_calls" : "waiting_for_codex_cli"
      },
      phoneVerification: {
        configured: phoneProvider.configured,
        provider: phoneMode,
        status: phoneProvider.configured ? "ready_for_write_eligibility" : "waiting_for_phone_verification_provider",
        missingEnv: phoneProvider.missing
      },
      authStore: {
        configured: authStore.configured,
        provider: "file_store",
        status: authStore.configured ? "ready_for_auth_sessions" : "waiting_for_auth_store_path",
        missingEnv: authStore.missing
      },
      translation: {
        configured: grok.configured || codexConfigured,
        provider: translationProvider,
        status: grok.configured || codexConfigured ? "ready_for_translation_calls" : "waiting_for_translation_provider"
      },
      copilot: {
        configured: true,
        provider: translationProvider,
        status: grok.configured || codexConfigured ? "ai_backend_ready" : "local_readiness_copilot"
      }
    }
  };
}
