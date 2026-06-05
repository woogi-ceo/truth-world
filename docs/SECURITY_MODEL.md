# Security Model

Truth World is small by design, but the public-interest write surface is treated
as security-sensitive.

## Assets

- Provider credentials: xAI/Grok, Truth Social partner API, phone verification.
- Auth/session store configured through `TRUTH_WORLD_AUTH_STORE`.
- Public feed integrity and source attribution.
- Write eligibility state: signed-in user, verified phone, verified country.

## Trust boundaries

- Browser input is untrusted.
- Feed provider payloads are untrusted even when the provider is approved.
- AI model output is untrusted and must be rendered as text, not executable HTML.
- Server environment variables are operator secrets and must not be serialized to
  client JavaScript, static JSON, screenshots, or public logs.

## Current controls

- State-changing auth/write routes require same-origin requests.
- Production auth requires HTTPS.
- Session cookies are `HttpOnly`, `SameSite=Lax`, and `Secure` in production.
- API quotas protect feed, auth/write, and AI routes.
- Production refuses implicit development auth store paths.
- Production blocks local Codex CLI translation fallback unless explicitly enabled.
- Provider URLs are normalized through allowlist policy.
- Remote preview images are blocked unless media hosts are allowlisted.
- Browser policy tests assert no direct xAI/Truth Social provider calls.

## Operational requirements

Before running public traffic:

1. Set `NODE_ENV=production`.
2. Set `TRUTH_WORLD_AUTH_STORE` outside the repository.
3. Use a real phone verification provider (`twilio` or `external`).
4. Configure TLS at the Node process or a trusted reverse proxy.
5. Set trusted proxy IPs before accepting forwarded protocol/IP headers.
6. Keep `TRUTH_WORLD_ALLOW_CODEX_TRANSLATION_IN_PRODUCTION` unset.
7. Keep `TRUTH_WORLD_ALLOW_REMOTE_CODEX_TRANSLATION` unset.
8. Configure partner/source/media allowlists narrowly.
9. Rotate any credentials that were ever used in local testing before launch.

## Known limitations

- The file-backed auth store is suitable for prototype and small operator tests,
  not multi-region production. A database-backed store should replace it before
  high-volume public launch.
- The current copilot UI is not yet a mature object-aware AI copilot.
- There is no moderation queue or abuse investigation workflow for public topic
  posting yet; write-like actions are gated but do not persist public posts.

