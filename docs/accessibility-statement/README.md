# Accessibility Statement Page

The `accessibility-statement` page is managed with localized Markdown files.

## Route

Main page route:

- `src/app/[locale]/accessibility-statement/page.tsx`

The page is available per locale, for example:

- `/sv/accessibility-statement`
- `/en/accessibility-statement`
- `/da/accessibility-statement`

## Files to update

Page body content:

- `content/accessibility-statement/sv.md`
- `content/accessibility-statement/en.md`
- `content/accessibility-statement/da.md`

## How it works

The route in `src/app/[locale]/accessibility-statement/page.tsx` loads:

- `content/accessibility-statement/{locale}.md`

That Markdown is rendered on the page with `src/components/ui/markdown.tsx`.


## How to update the page

1. Edit the Markdown file for each locale you want to update in `content/accessibility-statement/`.
2. Save the files and commit the changes.
