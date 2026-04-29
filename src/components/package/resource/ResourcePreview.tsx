"use client";

import CSVExplorerWrapper from "@/components/csv-explorer";
import { DataExplorer } from "@/components/data-explorer/DataExplorer";
//import CodeViewer from "@/components/ui/code-viewer";
import IframeWrapper from "@/components/ui/iframe";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Dataset, Resource } from "@/schemas/ckan";
import dynamic from "next/dynamic";
import { useLocale, useTranslations } from "next-intl";
import * as React from "react";
import JsonUrlViewer from "./JSONViewer";
import { getLocalizedText } from "@/lib/ckan-translations";
import { getOgcPreviewConfig } from "@/lib/ogc";
import { ExternalLink, Globe } from "lucide-react";

const PdfViewerClient = dynamic(() => import("./SimplePdfViewer"), {
  ssr: false,
});
const GeoJsonMap = dynamic(
  () => import("@/components/package/resource/GeoJsonViewer"),
  { ssr: false },
);
const OgcServiceMapPreview = dynamic(
  () => import("@/components/package/resource/OgcServiceMapPreview"),
  { ssr: false },
);

type OgcLinkGroup = {
  type: "wms" | "wfs";
  serviceUrl: string;
  getCapabilitiesUrl: string;
};

const OGC_NOISY_PARAMS = [
  "request",
  "query_layers",
  "info_format",
  "feature_count",
  "width",
  "height",
  "x",
  "y",
  "i",
  "j",
  "bbox",
  "count",
  "startindex",
  "maxfeatures",
  "outputformat",
  "resulttype",
];

function parseUrl(value: string): URL | null {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function buildGetCapabilitiesUrl(resourceUrl: string, type: "wms" | "wfs") {
  const parsed = parseUrl(resourceUrl);
  if (!parsed) return null;

  const query = new URLSearchParams(parsed.search);
  for (const key of OGC_NOISY_PARAMS) {
    query.delete(key);
  }

  if (type === "wms") {
    query.delete("typename");
    query.delete("typenames");
    query.delete("typeNames");
  } else {
    query.delete("layers");
  }

  query.set("service", type.toUpperCase());
  query.set("request", "GetCapabilities");

  return `${parsed.origin}${parsed.pathname}?${query.toString()}`;
}

function buildServiceApiUrl(resourceUrl: string, type: "wms" | "wfs") {
  const parsed = parseUrl(resourceUrl);
  if (!parsed) return null;

  const query = new URLSearchParams(parsed.search);
  for (const key of OGC_NOISY_PARAMS) {
    query.delete(key);
  }

  query.set("service", type.toUpperCase());
  if (type === "wms") {
    query.delete("typename");
    query.delete("typenames");
    query.delete("typeNames");
  } else {
    query.delete("layers");
  }

  const queryString = query.toString();
  return queryString
    ? `${parsed.origin}${parsed.pathname}?${queryString}`
    : `${parsed.origin}${parsed.pathname}`;
}

function toReadableUrl(url: string) {
  const parsed = parseUrl(url);
  if (!parsed) return url;
  return `${parsed.origin}${parsed.pathname}`;
}

function getOgcLinkGroups(resource: Resource): OgcLinkGroup[] {
  const groups: OgcLinkGroup[] = [];
  const candidates: Array<{ type: "wms" | "wfs"; url?: string }> = [
    { type: "wfs", url: resource.wfs_url },
    { type: "wms", url: resource.wms_url },
  ];

  for (const candidate of candidates) {
    if (!candidate.url) continue;
    const getCapabilitiesUrl = buildGetCapabilitiesUrl(
      candidate.url,
      candidate.type,
    );
    const serviceUrl = buildServiceApiUrl(candidate.url, candidate.type);
    if (!getCapabilitiesUrl || !serviceUrl) continue;
    groups.push({
      type: candidate.type,
      serviceUrl,
      getCapabilitiesUrl,
    });
  }

  return groups;
}

export default function ResourcePreview({
  resource,
  dataset,
}: {
  resource: Resource;
  dataset: Dataset;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const [showMobileLegend, setShowMobileLegend] = React.useState(false);
  const resourceName = getLocalizedText(resource.name_translated, locale, resource.name);
  const format = resource.format?.toLowerCase() || "--";
  const sldUrl = dataset.resources?.find(
    (r) => r.format?.toLocaleLowerCase() === "sld",
  )?.url;
  const ogcPreview = getOgcPreviewConfig(resource);
  const ogcLinkGroups = getOgcLinkGroups(resource);
  const hasOgcLinks = ogcLinkGroups.length > 0;
  const hasSld = !!sldUrl && (format === "geojson" || ogcPreview?.type === "wfs");
  const isMapPreview = format === "geojson" || !!ogcPreview;

  const previewContent = (() => {
    if (format === "geojson") {
      return (
        <GeoJsonMap
          data={resource.url ?? ""}
          styleUrl={sldUrl}
          showLegendOnMobile={showMobileLegend}
        />
      );
    }

    if (ogcPreview) {
      return (
        <OgcServiceMapPreview
          type={ogcPreview.type}
          resourceUrl={ogcPreview.resourceUrl}
          styleUrl={ogcPreview.type === "wfs" ? sldUrl : undefined}
          showLegendOnMobile={showMobileLegend}
        />
      );
    }

    
    if (format === "json") {
      return <JsonUrlViewer url={resource.url ?? ""} />;
    }

    if (resource.datastore_active) {
      return (
        <div className="-mt-5">
          <DataExplorer resource={resource} />
        </div>
      );
    }

    switch (format) {
      case "csv":
        return <CSVExplorerWrapper dataUrl={resource.url || ""} />;

      case "pdf":
        return <PdfViewerClient url={resource.url || ""} />;

      default:
        if (resource.iframe) {
          return (
            <IframeWrapper
              src={resource.url || ""}
              title={resourceName}
              height={800}
            />
          );
        }

        return t("Preview.notSupported");
    }
  })();

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-3">
        <Heading level={2} className="text-theme-green font-bold mb-0">
          {t("Common.preview")}
        </Heading>
        {hasSld && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="md:hidden"
            onClick={() => setShowMobileLegend((prev) => !prev)}
            aria-pressed={showMobileLegend}
          >
            {showMobileLegend
              ? t("Map.sldLegend.hideButton")
              : t("Map.sldLegend.showButton")}
          </Button>
        )}
      </div>

      {isMapPreview ? (
        <figure>
          <figcaption className="sr-only">
            {t("Preview.mapPreviewLabel", { name: resourceName })}
          </figcaption>
          {previewContent}
        </figure>
      ) : (
        previewContent
      )}

      {(hasOgcLinks || sldUrl) && (
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
                <ul className="mt-3 space-y-3 text-sm">
                  {[
                    {
                      label: t("Map.ogc.links.serviceApiUrl"),
                      url: group.serviceUrl,
                    },
                    {
                      label: t("Map.ogc.links.getCapabilitiesUrl"),
                      url: group.getCapabilitiesUrl,
                    },
                  ].map((item) => (
                    <li
                      key={`${group.type}-${item.label}`}
                      className="rounded-md border border-slate-200 bg-white p-3"
                    >
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                        {item.label}
                      </p>
                      <p
                        className="mt-1 truncate font-mono text-xs text-slate-700"
                        title={item.url}
                      >
                        {toReadableUrl(item.url)}
                      </p>
                      <details className="mt-2">
                        <summary className="cursor-pointer text-xs text-slate-600 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-green/60">
                          {t("Map.ogc.links.fullUrl")}
                        </summary>
                        <p className="mt-2 break-all rounded bg-slate-100 p-2 font-mono text-xs text-slate-700">
                          {item.url}
                        </p>
                      </details>
                      <div className="mt-3">
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={t("Map.ogc.links.openInNewTab", {
                              label: `${group.type.toUpperCase()} ${item.label}`,
                            })}
                          >
                            {t("Map.ogc.links.open")}
                            <ExternalLink aria-hidden="true" />
                          </a>
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {sldUrl && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 md:col-span-2">
                <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
                  {t("Map.ogc.links.sldTitle")}
                </h4>
                <div className="mt-3 rounded-md border border-slate-200 bg-white p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                    {t("Map.ogc.links.sldStyleUrl")}
                  </p>
                  <p className="mt-1 truncate font-mono text-xs text-slate-700" title={sldUrl}>
                    {toReadableUrl(sldUrl)}
                  </p>
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs text-slate-600 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-green/60">
                      {t("Map.ogc.links.fullUrl")}
                    </summary>
                    <p className="mt-2 break-all rounded bg-slate-100 p-2 font-mono text-xs text-slate-700">
                      {sldUrl}
                    </p>
                  </details>
                  <div className="mt-3">
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={sldUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={t("Map.ogc.links.openInNewTab", {
                          label: t("Map.ogc.links.sldStyleUrl"),
                        })}
                      >
                        {t("Map.ogc.links.open")}
                        <ExternalLink aria-hidden="true" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

    </div>
  );
}
