# Languages and routing

The portal uses `next-intl` with the Next.js App Router.

The supported locales come from `NEXT_PUBLIC_I18N_SUPPORTED_LOCALES`. The
default locale comes from `NEXT_PUBLIC_I18N_DEFAULT_LOCALE`. The current
repository includes Swedish (`sv`), English (`en`), and Danish (`da`) message
files.

```env
NEXT_PUBLIC_I18N_DEFAULT_LOCALE=sv
NEXT_PUBLIC_I18N_SUPPORTED_LOCALES=sv,en,da
```

All pages live under `src/app/[locale]`. When more than one locale is enabled,
`next-intl` uses `as-needed` prefixes: the default locale can use an unprefixed
URL, while the other locales use their locale prefix. With one locale enabled,
URLs have no locale prefix.

Interface translations are stored in:

- `messages/sv.json`
- `messages/en.json`
- `messages/da.json`

Localized Markdown is stored under `content/`. The About page, accessibility
statement, and disclaimer banner each load the file matching the active locale.

The language switcher uses the localized navigation helpers and keeps the same
pathname when the locale changes. It is hidden when only one locale is enabled.

When adding a locale, add its message file and any Markdown files required by
the localized content pages. Also include it in
`NEXT_PUBLIC_I18N_SUPPORTED_LOCALES`.
