## Matomo Integration

Matomo page tracking is integrated client-side for route changes in the Next.js app.

Key files:
- `src/components/analytics/matomo.tsx`
- `src/app/[locale]/layout.tsx`

## Where it is mounted

`MatomoTracker` is rendered once in the locale layout:
- `src/app/[locale]/layout.tsx`

This ensures tracking is active across all pages in that locale subtree.

## Required environment variables

- `NEXT_PUBLIC_MATOMO_URL`
- `NEXT_PUBLIC_MATOMO_SITE_ID`

If either value is missing, the tracker does nothing.

Example:

```env
NEXT_PUBLIC_MATOMO_URL=//localhost:8080
NEXT_PUBLIC_MATOMO_SITE_ID=1
```

## How tracking works

1. On first mount, the component:
- Initializes `window._paq`.
- Pushes setup commands:
  - `setTrackerUrl`
  - `setSiteId`
  - `enableLinkTracking`
  - `disableCookies`
- Injects Matomo script (`matomo.js`) once.

2. On route or query-string change (`pathname`, `searchParams`):
- Builds full URL (`origin + path + query`).
- Waits briefly for document title updates.
- Pushes:
  - `setCustomUrl`
  - `setDocumentTitle`
  - `trackPageView`

3. Duplicate protection:
- Last tracked URL/title are stored in refs.
- Same URL is not tracked twice in a row.

## Notes

- Tracking is SPA-friendly (client navigation aware).
- Cookies are disabled by default in current implementation.
- Script load failure is handled gracefully (no app crash).

