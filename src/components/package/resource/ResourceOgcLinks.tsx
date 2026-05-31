"use client";

import { ExternalLink, Globe } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import type { OgcLinkGroup } from "@/lib/ogc";
import { parseUrlSafely } from "@/lib/geospatial";

type ResourceOgcLinksProps = {
  ogcLinkGroups: OgcLinkGroup[];
  sldUrl?: string;
};

function toReadableUrl(url: string) {
  const parsed = parseUrlSafely(url);
  if (!parsed) return url;
  return `${parsed.origin}${parsed.pathname}`;
}

function ExternalUrlCard({
  label,
  url,
  ariaLabel,
}: {
  label: string;
  url: string;
  ariaLabel: string;
}) {
  const t = useTranslations();

  return (
    <div className="rounded-md border border-slate-200 bg-white p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
        {label}
      </p>
      <p
        className="mt-1 truncate font-mono text-xs text-slate-700"
        title={url}
      >
        {toReadableUrl(url)}
      </p>
      <details className="mt-2">
        <summary className="cursor-pointer text-xs text-slate-600 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-green/60">
          {t("Map.ogc.links.fullUrl")}
        </summary>
        <p className="mt-2 break-all rounded bg-slate-100 p-2 font-mono text-xs text-slate-700">
          {url}
        </p>
      </details>
      <div className="mt-3">
        <Button variant="outline" size="sm" asChild>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={ariaLabel}
          >
            {t("Map.ogc.links.open")}
            <ExternalLink aria-hidden="true" />
          </a>
        </Button>
      </div>
    </div>
  );
}

export default function ResourceOgcLinks({
  ogcLinkGroups,
  sldUrl,
}: ResourceOgcLinksProps) {
  const t = useTranslations();

  if (!ogcLinkGroups.length && !sldUrl) {
    return null;
  }

  return (
    <section
      aria-label={t("Map.ogc.links.title")}
      className="mb-5 mt-8 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="flex items-center gap-2">
        <Globe className="h-4 w-4 text-theme-green" aria-hidden="true" />
        <h3 className="text-base font-semibold text-slate-900">
          {t("Map.ogc.links.title")}
        </h3>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {ogcLinkGroups.map((group) => (
          <div
            key={group.type}
            className="rounded-lg border border-slate-200 bg-slate-50 p-4"
          >
            <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
              {group.type === "wfs"
                ? t("Map.ogc.links.wfsTitle")
                : t("Map.ogc.links.wmsTitle")}
            </h4>
            <div className="mt-3 space-y-3 text-sm">
              <ExternalUrlCard
                label={t("Map.ogc.links.serviceApiUrl")}
                url={group.serviceUrl}
                ariaLabel={t("Map.ogc.links.openInNewTab", {
                  label: `${group.type.toUpperCase()} ${t("Map.ogc.links.serviceApiUrl")}`,
                })}
              />
              <ExternalUrlCard
                label={t("Map.ogc.links.getCapabilitiesUrl")}
                url={group.getCapabilitiesUrl}
                ariaLabel={t("Map.ogc.links.openInNewTab", {
                  label: `${group.type.toUpperCase()} ${t("Map.ogc.links.getCapabilitiesUrl")}`,
                })}
              />
            </div>
          </div>
        ))}

        {sldUrl && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 md:col-span-2">
            <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
              {t("Map.ogc.links.sldTitle")}
            </h4>
            <div className="mt-3">
              <ExternalUrlCard
                label={t("Map.ogc.links.sldStyleUrl")}
                url={sldUrl}
                ariaLabel={t("Map.ogc.links.openInNewTab", {
                  label: t("Map.ogc.links.sldStyleUrl"),
                })}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
