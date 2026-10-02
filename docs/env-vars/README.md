# Environment variables

The frontend reads its runtime configuration from these variables.

| Variable | Default | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_DMS` | None | CKAN base URL. The CKAN client throws an error when it is missing. |
| `ISR_REVALIDATE` | `150` | Cache revalidation time, in seconds, for CKAN requests that use ISR. Invalid or zero values fall back to `150`. |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | Public portal URL used to build canonical and alternate-language metadata. A trailing slash is removed. |
| `NEXT_PUBLIC_I18N_DEFAULT_LOCALE` | `sv` | Default locale used by `next-intl`. It must also be in the supported locale list. |
| `NEXT_PUBLIC_I18N_SUPPORTED_LOCALES` | `sv` | Comma-separated locale list. The repository contains messages and content for `sv`, `en`, and `da`. |
| `NEXT_PUBLIC_MATOMO_URL` | Empty | Matomo base URL. Trailing slashes are removed. |
| `NEXT_PUBLIC_MATOMO_SITE_ID` | Empty | Matomo site ID. Tracking stays disabled if this or the Matomo URL is empty. |
| `NEXT_PUBLIC_MAX_PREVIEW_SIZE_BYTES` | `524288000` (500 MB) | Byte threshold used two ways: (1) as a metadata check against CKAN's recorded `resource.size` for GeoJSON, JSON, CSV, PDF, and DWG before rendering; (2) as a live cutoff GeoJSON, JSON, and CSV enforce by aborting their fetch once real bytes received cross it, regardless of CKAN metadata. Over the limit, `Preview.tooLargeToPreview` shows instead of a preview. Invalid or zero values fall back to the default. PDF and DWG are covered by (1) only — see [resource-preview](../resource-preview/README.md#size-gating) for the gap this leaves. Datastore, WMS/WFS, and generic iframe previews are not size-gated at all. |

## Local example

```env
NEXT_PUBLIC_DMS=https://ckan.city-of-malmo.datopian.com
ISR_REVALIDATE=150
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_I18N_DEFAULT_LOCALE=sv
NEXT_PUBLIC_I18N_SUPPORTED_LOCALES=sv,en,da
NEXT_PUBLIC_MATOMO_URL=
NEXT_PUBLIC_MATOMO_SITE_ID=
NEXT_PUBLIC_MAX_PREVIEW_SIZE_BYTES=524288000
```

The accessibility workflow supplies its own values in
`.github/workflows/a11y.yml` and reads `NEXT_PUBLIC_DMS` from a GitHub secret.
