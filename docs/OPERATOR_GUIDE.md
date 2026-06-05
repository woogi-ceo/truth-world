# Operator Guide

This guide is for the person running Truth World. End users do not bring API
keys; operators configure providers on the server.

## Local development

```bash
npm start
```

Local development defaults:

- Host: `127.0.0.1`
- Port: `4173`
- Source feed: manual seed fixture
- Phone verification: `dev_auto`
- Auth store: `data/auth-store.dev.json`

The local auth store is ignored by Git. Delete it whenever you want to reset
local accounts.

## Production baseline

```bash
export NODE_ENV=production
export HOST=127.0.0.1
export PORT=4173
export TRUTH_WORLD_AUTH_STORE=/var/lib/truth-world/auth-store.json
export TRUTH_WORLD_PHONE_VERIFICATION_MODE=twilio
export TWILIO_ACCOUNT_SID=...
export TWILIO_AUTH_TOKEN=...
export TWILIO_VERIFY_SERVICE_SID=...
export XAI_API_KEY=...
export TRUTH_SOCIAL_PARTNER_API_BASE=https://partner-feed.example
export TRUTH_SOCIAL_PARTNER_API_KEY=...
npm start
```

Production requirements:

- Run behind HTTPS.
- Keep the auth store outside the repository.
- Do not enable Codex CLI fallback for public traffic.
- Use narrow source and media host allowlists.
- Use a provider-backed phone verification mode.

## Reverse proxy

Forwarded protocol and IP headers are ignored unless enabled:

```bash
export TRUTH_WORLD_TRUST_PROXY_HEADERS=1
export TRUTH_WORLD_TRUSTED_PROXY_IPS=10.0.0.7
```

Only set trusted proxy IPs to infrastructure you control.

## Readiness

Check:

```http
GET /api/readiness
```

Interpretation:

- `readOk`: partner feed plus AI backend are configured.
- `writeOk`: auth store and phone verification are configured.
- `aiOk`: Grok or a permitted translation backend is configured.
- `ok`: all of the above are ready.

Do not equate a green process health check with public launch readiness.

## Incident defaults

If a partner feed fails, `/api/feed` falls back to manual seed data and marks the
payload as degraded. The UI must not call this live partner data.

If translation fails, the UI keeps original text visible and reports translation
unavailable instead of blanking the screen.

If phone verification fails, write-like actions remain blocked.

