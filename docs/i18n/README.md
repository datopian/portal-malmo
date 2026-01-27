## How i18n routing works

This project uses **next-intl with the App Router** to handle internationalized routes.

The behavior depends on `NEXT_PUBLIC_I18N_LANGUAGES_AVAILABLE`:

### Single language (no URL prefix)

```env
NEXT_PUBLIC_I18N_LANGUAGES_AVAILABLE=pt
```

Routes will be:

* `/`
* `/search`
* `/organizations`

No language prefix is added to the URL.

---

### Multiple languages (language in the URL)

```env
NEXT_PUBLIC_I18N_LANGUAGES_AVAILABLE=en,pt
```

Routes will be:

* `/en`
* `/en/search`
* `/pt`
* `/pt/search`

The active language is controlled by the URL prefix and switched dynamically using the language switcher in the header.

---

### Notes

* All pages live under `app/[locale]/...`
* Locale detection is handled by `next-intl` middleware.
* Translations are loaded dynamically from:

  ```
  /messages/{locale}.json
  ```
* The language switcher updates only the locale prefix in the URL and keeps the user on the same page.
