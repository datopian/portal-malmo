# Malmö Open Data Portal

This repository contains the Next.js frontend for Malmö's open data portal. It
reads datasets, organizations, themes, resources, and activity data from CKAN.

## Main features

- Dataset search with themes, organizations, tags, formats, sorting, and pagination
- Organization, dataset, and resource pages
- Swedish, English, and Danish content and interface translations
- CKAN DataStore, CSV, JSON, PDF, GeoJSON, WMS, WFS, GPKG fallback, DWG, and iframe previews
- SLD styling and legends for supported spatial previews
- Matomo page tracking
- Cypress and Axe accessibility checks

## Local development

The GitHub Actions workflow uses Node.js 20. Install the dependencies and start
the development server:

```bash
npm ci
npm run dev
```

The portal is available at `http://localhost:3000`.

Create a `.env` file before starting the app:

```env
NEXT_PUBLIC_DMS=https://ckan.city-of-malmo.datopian.com
ISR_REVALIDATE=150
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_I18N_DEFAULT_LOCALE=sv
NEXT_PUBLIC_I18N_SUPPORTED_LOCALES=sv,en,da
NEXT_PUBLIC_MATOMO_URL=
NEXT_PUBLIC_MATOMO_SITE_ID=
```

`NEXT_PUBLIC_DMS` is required. Matomo is disabled when either Matomo variable is
empty. See [the environment variable guide](docs/env-vars/README.md) for details.

## Checks

```bash
npm run build
npm run test:e2e
```

`test:e2e` generates routes, builds and starts the application, and runs the
Cypress/Axe accessibility suite. It needs a reachable CKAN instance.

## Project guides

- [Environment variables](docs/env-vars/README.md)
- [Languages and routing](docs/i18n/README.md)
- [Dataset search](docs/search-page/README.md)
- [Resource previews](docs/resource-preview/README.md)
- [WMS and WFS resources](docs/wms-wfs/README.md)
- [Matomo](docs/matomo/README.md)
- [Accessibility checks](docs/accessibility-checks/README.md)
- [Localized content](content/)

Deployment and rollback are not configured or documented in this repository.
Confirm the current process with the person responsible for the hosting
environment.
