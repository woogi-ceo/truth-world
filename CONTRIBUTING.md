# Contributing

Truth World contributions should keep the project small, transparent, and easy to audit.

## Ground rules

- No scraper, crawler, browser automation collector, or hidden Truth Social extraction.
- No new dependency without a concrete reason.
- Keep source text, AI summary, translation, claims, and verification status separate.
- Add tests for Grok proxy behavior and policy-sensitive changes.
- Keep UI changes responsive on mobile and desktop.

## Local checks

```bash
npm test
```

## Commit style

Use the workspace Lore Commit Protocol when committing changes. The first line should explain why the change exists, and trailers should record testing and risk where useful.
