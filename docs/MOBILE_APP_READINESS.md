# Mobile App Readiness

Truth World is designed mobile-first. The web app should remain the source of
truth for the first mobile release, whether the launch path is PWA, a trusted
native wrapper, or a later fully native app.

## Current mobile-ready foundation

- Mobile bottom navigation for Truth, Topics, and News.
- Floating mobile actions for account access and AI.
- Region and language controls in the mobile header.
- News detail pages with back navigation.
- PWA manifest with install metadata and shortcuts.
- Service worker for static shell caching.
- Offline page that avoids showing stale public-interest feed data.
- iOS/Android web app metadata.

## Data safety rule

Do not cache `/api/*` responses in the service worker. Feed, translation,
summarization, auth, and write eligibility are network-bound because stale data
can mislead readers.

## Next release steps

1. Add PNG app icons at 192x192, 512x512, and maskable 512x512.
2. Add app-store-ready screenshots for 390x844, 430x932, and tablet widths.
3. Add a real `/api/copilot` provider before marketing the AI surface as a full
   copilot.
4. Add moderation and abuse-reporting flows before persistent public posting.
5. Decide launch path:
   - PWA first for fastest iteration.
   - Native wrapper after PWA behavior is stable.
   - Full native only after backend/provider contracts stabilize.

## Native wrapper constraints

The wrapper must not embed provider credentials. It should call the same server
API used by the web app and preserve the same source/AI/verification separation.
