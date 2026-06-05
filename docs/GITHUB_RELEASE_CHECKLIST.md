# GitHub Release Checklist

Use this before creating the first public GitHub repository.

## Required local checks

```bash
npm test
```

## Files that should be committed

- Source: `server.js`, `src/`, `public/`.
- Tests: `test/`.
- Public docs: `README.md`, `CONTRIBUTING.md`, `EDITORIAL_POLICY.md`,
  `LEGAL_NOTES.md`, `SECURITY.md`, `docs/`.
- Templates: `.github/`.
- Runtime data placeholder: `data/.gitkeep`.

## Files that must not be committed

- `.env` or any environment file except `.env.example`.
- `data/auth-store*.json`.
- `.omx/`, `.codex/`, local logs, local screenshots, and generated QA media.
- Provider credentials, session stores, private prompts, partner payload samples
  containing non-public data, or operator-only runbooks.

## First repository setup

1. Initialize Git only after the ignore rules are in place.
2. Run `git status --ignored` and verify ignored runtime files are not staged.
3. Run `npm test`.
4. Create the repository with MIT license visibility and this README.
5. Add provider credentials only in deployment secrets, never in the repository.

## Public positioning

Truth World is an independent open-source prototype. Do not claim affiliation,
endorsement, API access, or operational support from Truth Social, xAI, SpaceX,
Donald Trump, or Elon Musk unless written approval exists.

