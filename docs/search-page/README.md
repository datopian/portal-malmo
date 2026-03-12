## Search Page

The search page is a URL-driven CKAN package search UI.

Main route:
- `src/app/[locale]/data/page.tsx`

Main layout/state:
- `src/components/package/search/SearchLayout.tsx`
- `src/components/package/search/SearchContext.tsx`

## Data flow

1. URL query params are parsed in `SearchStateProvider` into `PackageSearchOptions`.
2. `usePackageSearch(options)` fetches results + facets.
3. UI components read state from `useSearchState()`.
4. User actions update URL via `setOptions`, which triggers a refetch.

Because URL is the source of truth:
- State is shareable via links.
- Back/forward browser navigation works naturally.

## Filters

Filter UI:
- `src/components/package/search/Facets.tsx`
- `src/components/package/search/FacetCard.tsx`
- `src/components/package/search/ActiveFilters.tsx`

Supported facet filters:
- `groups`
- `resFormat`
- `tags`
- `orgs` (unless locked by `defaultOrg`)

Behavior:
- Selecting/removing filters calls `setOptions(...)`.
- Filter changes reset `offset` to `0`.
- Active filters are shown as removable chips.
- On mobile, filters open in a dialog panel.

## Sorting

Sort UI:
- `src/components/package/search/SortBy.tsx`

Available options:
- `score desc` (relevance)
- `metadata_modified desc`
- `title_string asc`
- `title_string desc`

Behavior:
- Sorting updates `sort` in URL.
- Sorting also resets `offset` to `0`.
- Default sort is:
  - `score desc` when a query exists.
  - `metadata_modified desc` when query is empty.

## Pagination

Pagination UI:
- `src/components/package/search/Pagination.tsx`

Behavior:
- Uses `offset` + `limit` from options.
- `limit` is fixed to `10` in `SearchStateProvider`.
- Clicking page buttons updates `offset`.
- Smooth-scrolls to top after page change.
- Pagination is shown only when `count > limit`.

## Search input

File:
- `src/components/package/search/SearchForm.tsx`

Behavior:
- Outside `/data`, submitting redirects to localized `/data?query=...`.
- Inside `/data`, submitting updates query in-place.
- Clearing query removes `query` from URL.

