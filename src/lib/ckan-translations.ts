export type LocalizedMap = Record<string, string> | null | undefined;

export type LocalizedTextResult = {
  text: string;
  lang?: string;
};

const getPrimaryLocale = (locale: string): string => {
  const normalized = locale.toLowerCase();
  return normalized.split("-")[0] ?? normalized;
};

export function getLocalizedText(
  translated: LocalizedMap,
  locale: string,
  fallback?: string | null
): string {
  return getLocalizedTextWithLang(translated, locale, fallback).text;
}

export function getLocalizedTextWithLang(
  translated: LocalizedMap,
  locale: string,
  fallback?: string | null
): LocalizedTextResult {
  const fallbackValue = fallback ?? "";
  if (!translated || typeof translated !== "object") {
    return { text: fallbackValue };
  }

  const exact = translated[locale];
  if (typeof exact === "string" && exact.trim().length > 0) {
    return { text: exact, lang: locale };
  }

  const normalizedLocale = locale.toLowerCase();
  const normalized = translated[normalizedLocale];
  if (typeof normalized === "string" && normalized.trim().length > 0) {
    return { text: normalized, lang: normalizedLocale };
  }

  const primaryLocale = getPrimaryLocale(locale);
  const primary = translated[primaryLocale];
  if (typeof primary === "string" && primary.trim().length > 0) {
    return { text: primary, lang: primaryLocale };
  }

  return { text: fallbackValue };
}
