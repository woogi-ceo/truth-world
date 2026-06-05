# Truth World

Truth World is a static-first open-source prototype for global readers who want source-linked AI summaries and translations of approved Truth Social content.

The v1 implementation is intentionally small:

- Static HTML, CSS, and browser JavaScript.
- A minimal Node proxy for Grok/xAI API calls with server-side quota controls.
- Manual/demo input only until approved Truth Social partner access exists.
- Transparent AI output: summary, translation, claims, and verification status are separate.
- Global-first reading: users can start from Global, then narrow by region, country, and summary language.

This package is marked `private: true` to prevent accidental npm publication.
It can still be published as a public GitHub repository.

## Why no crawler

Truth World does not include a scraper, crawler, bot, or automated Truth Social collector. Live ingestion should be implemented only through approved partner/API access. Until then, the project uses demo fixtures and manual user-provided source text.

## Run

```bash
npm start
```

Open `http://127.0.0.1:4173`.

The frontend includes PWA metadata and a service worker so the web app can serve
as the first mobile-app foundation. The service worker caches only the static app
shell; `/api/*` responses are intentionally network-only to avoid stale public
interest information.

End users never provide API keys. They use Truth World through the web app. Truth World operators configure approved provider credentials only on the server.

For local/operator setup, manual Grok analysis uses xAI when configured:

```bash
export XAI_API_KEY="your_xai_api_key"
export XAI_MODEL="grok-4.3"
npm start
```

Live screen translation uses the server-side translation provider boundary. It prefers `XAI_API_KEY` when present. In local development only, it can fall back to the local Codex CLI provider when `codex exec` is available. Production blocks Codex fallback by default so public traffic cannot reach a local agent boundary.

Optional Codex translation controls:

```bash
export CODEX_TRANSLATION_MODEL="gpt-5.5"
export CODEX_TRANSLATION_TIMEOUT_MS="120000"
# export CODEX_TRANSLATION_DISABLED="1" # disables Codex fallback
# export TRUTH_WORLD_ALLOW_REMOTE_CODEX_TRANSLATION="1" # not recommended
# export TRUTH_WORLD_ALLOW_CODEX_TRANSLATION_IN_PRODUCTION="1" # not recommended
npm start
```

## Security and write eligibility

Reading remains public. Writing, topic participation, and subscription-like actions require a signed-in account with verified phone and country. The browser checks this for UX, and `/api/write/action` also enforces it server-side so UI bypasses cannot create write-like actions.

Local development defaults to `TRUTH_WORLD_PHONE_VERIFICATION_MODE=dev_auto`, which marks new accounts verified so the UI remains easy to test. Production must use a provider-backed mode:

```bash
export NODE_ENV="production"
export TRUTH_WORLD_AUTH_STORE="/var/lib/truth-world/auth-store.json"
export TRUTH_WORLD_PHONE_VERIFICATION_MODE="twilio"
export TWILIO_ACCOUNT_SID="..."
export TWILIO_AUTH_TOKEN="..."
export TWILIO_VERIFY_SERVICE_SID="..."
npm start
```

You can also use a compatible external verification service:

```bash
export TRUTH_WORLD_PHONE_VERIFICATION_MODE="external"
export TRUTH_WORLD_PHONE_VERIFY_START_URL="https://verify.example/start"
export TRUTH_WORLD_PHONE_VERIFY_CHECK_URL="https://verify.example/check"
export TRUTH_WORLD_PHONE_VERIFY_API_KEY="..."
```

Production auth requests require HTTPS, production session cookies are always issued with `Secure`, and production refuses to use the implicit development auth store path. Public AI, feed, auth, and write-action endpoints are protected by in-memory quotas:

```bash
export TRUTH_WORLD_AI_QUOTA_MAX="30"
export TRUTH_WORLD_AI_QUOTA_WINDOW_MS="60000"
export TRUTH_WORLD_FEED_QUOTA_MAX="120"
export TRUTH_WORLD_FEED_QUOTA_WINDOW_MS="60000"
export TRUTH_WORLD_AUTH_QUOTA_MAX="20"
export TRUTH_WORLD_AUTH_QUOTA_WINDOW_MS="300000"
```

If the Node process is behind a TLS-terminating reverse proxy, forwarded protocol/IP headers are ignored unless explicitly enabled for known proxy IPs:

```bash
export TRUTH_WORLD_TRUST_PROXY_HEADERS="1"
export TRUTH_WORLD_TRUSTED_PROXY_IPS="10.0.0.7"
```

Partner source URLs default to Truth Social hosts only. Remote preview images are blocked unless the operator allowlists media hosts. Production rejects `http:` provider/source/media URLs and rejects wildcard host allowlists:

```bash
export TRUTH_WORLD_ALLOWED_SOURCE_HOSTS="truthsocial.com,www.truthsocial.com"
export TRUTH_WORLD_ALLOWED_MEDIA_HOSTS="media.example,cdn.example"
```

Use `TRUTH_WORLD_ALLOWED_SOURCE_HOSTS="*"` only for a trusted internal development demo; production will fail closed instead of accepting wildcard allowlists.

Approved Truth Social partner feed access is wired through server-only operator environment variables:

```bash
export TRUTH_SOCIAL_PARTNER_API_BASE="https://partner-feed.example"
export TRUTH_SOCIAL_PARTNER_API_KEY="your_partner_feed_key"
export TRUTH_SOCIAL_PARTNER_FEED_PATH="/feed"
export TRUTH_SOCIAL_WATCHLIST_ID="default_watchlist_98"
npm start
```

When those variables are absent, `/api/feed` returns the manual seed fixture. When they are present, `/api/feed` attempts the approved partner feed and falls back to `manual_seed` if the partner request fails. The browser never calls Truth Social or xAI directly, and users never need to bring their own API key.

Readiness can be checked without exposing secrets:

```http
GET /api/readiness
```

The readiness payload separates `readOk`, `writeOk`, and `aiOk`; top-level `ok` requires all three.

## Grok API

The browser calls the local endpoint:

```http
POST /api/summarize
content-type: application/json

{
  "text": "Source text to summarize...",
  "targetLanguage": "ko",
  "sourceUrl": "https://truthsocial.com/..."
}
```

The server calls xAI's Responses API and keeps `XAI_API_KEY` server-side. Requests set `store: false` so this prototype does not ask xAI to retain the summarization exchange.

Full-screen translation uses the same server-side secret boundary:

```http
POST /api/translate
content-type: application/json

{
  "targetLanguage": "Chinese",
  "items": [
    {
      "id": "ui:chrome",
      "type": "ui_catalog",
      "fields": {
        "nav.truth": "Truth"
      }
    }
  ]
}
```

The browser requests only currently visible UI/feed fields and keeps translated results in memory by language. If Grok is not configured, `/api/translate` attempts Codex CLI translation server-side only outside production. If every translation provider fails, the app keeps showing the original fixture text and marks live translation as unavailable in the AI panel.

## Source provider roadmap

- `manual_seed`: current demo fixtures and manual text.
- `truth_partner_api`: future approved Truth Social API or partner feed.
- `spacex_ops`: future operations handoff target only; no current SpaceX integration is claimed or implemented.

## Tests

```bash
npm test
```

## Public project docs

- [Architecture](docs/ARCHITECTURE.md)
- [Provider contracts](docs/PROVIDER_CONTRACTS.md)
- [Security model](docs/SECURITY_MODEL.md)
- [Operator guide](docs/OPERATOR_GUIDE.md)
- [Mobile app readiness](docs/MOBILE_APP_READINESS.md)
- [GitHub release checklist](docs/GITHUB_RELEASE_CHECKLIST.md)

## Official references

- xAI API docs: https://docs.x.ai/
- xAI text generation guide: https://docs.x.ai/developers/model-capabilities/text/generate-text
- Truth Social Terms of Service: https://help.truthsocial.com/legal/terms-of-service/
