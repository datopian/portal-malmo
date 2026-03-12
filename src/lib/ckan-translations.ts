export type LocalizedMap = Record<string, string> | null | undefined;

const getPrimaryLocale = (locale: string): string => {
  const normalized = locale.toLowerCase();
  return normalized.split("-")[0] ?? normalized;
};

export function getLocalizedText(
  translated: LocalizedMap,
  locale: string,
  fallback?: string | null
): string {
  const fallbackValue = fallback ?? "";
  if (!translated || typeof translated !== "object") {
    return fallbackValue;
  }

  const exact = translated[locale];
  if (typeof exact === "string" && exact.trim().length > 0) {
    return exact;
  }

  const normalizedLocale = locale.toLowerCase();
  const normalized = translated[normalizedLocale];
  if (typeof normalized === "string" && normalized.trim().length > 0) {
    return normalized;
  }

  const primary = translated[getPrimaryLocale(locale)];
  if (typeof primary === "string" && primary.trim().length > 0) {
    return primary;
  }

  return fallbackValue;
}
