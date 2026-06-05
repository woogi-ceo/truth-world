## Summary

- 

## Safety checklist

- [ ] No scraper, crawler, browser automation collector, or unofficial Truth Social extraction was added.
- [ ] No provider key, session data, phone number, private prompt, or partner payload was committed.
- [ ] Browser code still calls only local `/api/*` endpoints for providers.
- [ ] Source text, summary, translation, claims, and verification status remain separate.
- [ ] Public write-like actions remain gated by server-side auth and write eligibility.
- [ ] `npm test` passes.

## Testing

```bash
npm test
```

