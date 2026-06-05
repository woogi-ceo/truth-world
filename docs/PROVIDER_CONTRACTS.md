# Provider Contracts

This repository should be runnable without private credentials. Operators add
provider credentials on the server through environment variables.

## Source feed provider

Current providers:

- `manual_seed`: local fixture in `public/data/posts.json`.
- `truth_partner_api`: approved partner/API feed, configured by the operator.

The partner feed must return JSON with one of these item arrays:

- `posts`
- `statuses`
- `items`

Each item may include:

```json
{
  "id": "source-stable-id",
  "username": "approved_source",
  "created_at": "2026-06-05T00:00:00Z",
  "url": "https://truthsocial.com/@source/posts/1",
  "content": "Source text",
  "country_codes": ["KR", "JP"],
  "hashtags": ["security"],
  "card": {
    "title": "Linked article",
    "description": "Context",
    "image": "https://media.example/image.jpg"
  }
}
```

Server normalization strips HTML, bounds response size, allowlists source/media
hosts, and falls back to manual seed data when the live provider fails.

## Translation provider

`POST /api/translate` receives:

```json
{
  "targetLanguage": "Korean",
  "items": [
    {
      "id": "stable-id",
      "type": "ui_catalog",
      "fields": {
        "button.submit": "Submit"
      }
    }
  ]
}
```

The provider must return:

```json
{
  "items": [
    {
      "id": "stable-id",
      "type": "ui_catalog",
      "fields": {
        "button.submit": "제출"
      }
    }
  ],
  "model": "provider:model",
  "cached": false
}
```

Rules:

- Preserve item ids, item types, field names, arrays, URLs, handles, hashtags,
  numbers, and source names.
- Translate values only.
- Return JSON only.
- Never expose provider keys to the browser.

## Summarization provider

`POST /api/summarize` is for manual source analysis. It returns separate
summary, translation, claims, and verification status fields. It must not
convert source material into endorsement, campaign copy, or independently
verified claims unless independent evidence is supplied.

## Copilot boundary

The current copilot UI is not a private internal copilot export. A production
OSS copilot should be added as a provider interface with:

- structured selected context,
- server-side prompt-injection filtering,
- citations/source references,
- bounded answer size,
- no browser-side provider key,
- operator-controlled model/provider selection.

