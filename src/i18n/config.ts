import { envVars } from "@/lib/env";

export const locales = envVars.i18nSupportedLocales
  ?.map((l) => l.trim())
  .filter(Boolean) as [string, ...string[]]; // at least one

export const defaultLocale = envVars.i18nDefaultLocale ?? locales[0];

// If there is only 1 locale -> no prefix in URL
// If there are multiple -> always prefix (/en, /pt, ...)
export const localePrefix = locales.length === 1 ? "never" : "always";
