export const envVars = {
  siteUrl:
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "http://localhost:3000",
  dms: process.env.NEXT_PUBLIC_DMS,
  isrRevalidate: Number(process.env.ISR_REVALIDATE ?? "300"),
  i18nDefaultLocale: process.env.NEXT_PUBLIC_I18N_DEFAULT_LOCALE ?? "en",
  i18nSupportedLocales: (process.env.NEXT_PUBLIC_I18N_SUPPORTED_LOCALES ?? "en")
    .split(",")
    .map((l) => l.trim())
    .filter(Boolean),
} as const;
