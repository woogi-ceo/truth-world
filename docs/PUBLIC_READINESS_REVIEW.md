# Public Readiness Review

Date: 2026-06-05

Scope: current Truth World project tree prepared for first GitHub publication.

## Review verdict

Independent review status after fixes:

- Code/security lane: blocking findings addressed.
- Architecture lane: `WATCH`, not `BLOCK`.
- Final publication posture: ready for maintainer inspection and later GitHub
  remote connection, with known prototype debt documented.

## Blocking findings addressed

1. Partner feed fallback could be mislabeled as live.
   - Fixed by driving browser provider copy from `payload.provider.live`,
     `payload.provider.status`, and `fallbackReason`.
   - Covered by `test/policy.test.js`.

2. Runtime `.omx` state and local auth stores could be accidentally published.
   - Fixed with stronger `.gitignore`.
   - Local auth store JSON files were removed from the publishable tree.
   - Covered by `test/public-release.test.js`.

3. Production state-changing routes accepted missing `Origin`.
   - Fixed by rejecting missing `Origin` on production mutating auth/write routes.
   - Covered by `test/server-security.test.js`.

## Public guardrails added

- `SECURITY.md`
- `.github/PULL_REQUEST_TEMPLATE.md`
- `.github/ISSUE_TEMPLATE/bug_report.md`
- `.github/ISSUE_TEMPLATE/security_hardening.md`
- `docs/ARCHITECTURE.md`
- `docs/PROVIDER_CONTRACTS.md`
- `docs/SECURITY_MODEL.md`
- `docs/OPERATOR_GUIDE.md`
- `docs/GITHUB_RELEASE_CHECKLIST.md`

## Known prototype debt

- `server.js` remains a compact prototype server that mixes routing, static
  serving, and provider selection.
- `public/app.js` remains a browser monolith that mixes UI rendering, auth,
  translation, and local copilot behavior.
- The copilot surface is not yet a mature object-aware AI provider contract.
- The file-backed auth store is not a high-scale production database.

These are acceptable for first public repository inspection because the provider,
security, and release boundaries are now explicit and tested. Refactor before
wide external contribution or public high-volume operation.

## Verification

```bash
npm test
node --check server.js
node --check public/app.js
git status --short --ignored
git check-ignore -v .omx/state/session.json data/auth-store.dev.json .env public-test.png
```

