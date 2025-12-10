import type { Metadata } from "next";
import { envVars } from "@/lib/env";
import { routing } from "@/i18n/routing";

type BuildMetadataArgs = {
  locale: string;
  pathname: string; // path AFTER the locale, e.g. "/", "/search", "/organizations", `/${org}/${dataset}`
  title: string;
  description: string;
};

export function buildLocalizedMetadata({
  locale,
  pathname,
  title,
  description,
}: BuildMetadataArgs): Metadata {

  const base = envVars.siteUrl.replace(/\/$/, "");
  const locales = routing.locales;
  const defaultLocale = routing.defaultLocale;

  // Helper to get full path for a locale, including prefix
  const pathForLocale = (loc: string) => {
    const isDefault = loc === defaultLocale;
    const prefix =
      routing.localePrefix === "never" && isDefault ? "" : `/${loc}`;

    if (pathname === "/" || pathname === "") {
      return prefix || "/";
    }

    return `${prefix}${pathname}`;
  };

  const languageAlternates = Object.fromEntries(
    locales.map((loc) => [loc, pathForLocale(loc)])
  );

  const canonicalPath = pathForLocale(locale).replace(base, "");

  return {
    metadataBase: new URL(base),
    title: {
      default: title,
      template: `%s | ${title}`,
    },
    description,
    alternates: {
      canonical: canonicalPath,
      languages: languageAlternates,
    },
    openGraph: {
      type: "website",
      url: canonicalPath,
      siteName: title,
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}