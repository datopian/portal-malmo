import { envVars } from "@/lib/env";

export const locales = envVars.i18nSupportedLocales
  ?.map((l) => l.trim())
  .filter(Boolean) as [string, ...string[]]; // at least one

export const defaultLocale = envVars.i18nDefaultLocale ?? locales[0];

export const localePrefix = locales.length === 1 ? "never" : "as-needed";
