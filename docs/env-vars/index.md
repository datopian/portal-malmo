## Environment variables

This project uses the following environment variables:

| Variable                               | Default                                 | Description                                                                                                                                                            | Example                                                 |
| -------------------------------------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `NEXT_PUBLIC_DMS`                      | —                                       | Base URL of the PortalJS Cloud API. This must always follow the pattern `https://api.cloud.portaljs.com/@<organization-name>`.                                    | `https://api.cloud.portaljs.com/@datopian` |
| `ISR_REVALIDATE`                       | `300`                                   | Incremental Static Regeneration (ISR) revalidation interval in seconds. Controls how often static pages are refreshed with new data.                                   | `300`                                                   |
| `NEXT_PUBLIC_SITE_URL`                 | —                                       | Public base URL of the portal, used for SEO metadata and canonical URLs.                                                                                               | `http://localhost:3000`                                 |
| `NEXT_PUBLIC_I18N_DEFAULT_LOCALE`    | First language in `LANGUAGES_AVAILABLE` | Default language used when no locale is present in the URL.                                                                                                            | `pt`                                                    |
| `NEXT_PUBLIC_I18N_SUPPORTED_LOCALES` | `en`                                    | Comma-separated list of supported languages. If only one is provided, routes are not prefixed. If more than one is provided, routes are localized (e.g. `/en`, `/pt`). | `en,pt`                                                 |

### Example `.env` file

```env
NEXT_PUBLIC_DMS=https://api.cloud.portaljs.com/@datopian
ISR_REVALIDATE=300
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_I18N_DEFAULT_LOCALE=pt
NEXT_PUBLIC_I18N_SUPPORTED_LOCALES=en,pt
```
