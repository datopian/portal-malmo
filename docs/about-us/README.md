# About Us Page Content

This page is managed with Markdown files, one per language.

## Files to update

- English: `content/about-us/en.md`
- Swedish: `content/about-us/sv.md`

## How to update content

1. Open `content/about-us/en.md` and edit the English text.
2. Open `content/about-us/sv.md` and edit the Swedish text.
3. Save both files.

## How it works

The page at `src/app/[locale]/about-us/page.tsx` loads content from:

- `about-us/en.md` when locale is `en`
- `about-us/sv.md` when locale is `sv`

## Quick check

1. Run the app locally.
2. Open `/en/about-us` and confirm English content.
3. Open `/sv/about-us` and confirm Swedish content.
