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
  const hasSld =
    format === "geojson" &&
    !!dataset.resources?.find((r) => r.format?.toLocaleLowerCase() === "sld")
      ?.url;
  const isMapPreview = format === "geojson" || format === "wms" || format === "wfs";

  const previewContent = (() => {
    if ((format === "wms" || format === "wfs") && resource.url) {
      return <OgcServiceMapPreview type={format} resourceUrl={resource.url} />;
    }

    if (format === "geojson") {
      return (
        <GeoJsonMap
          data={resource.url ?? ""}
          styleUrl={
            dataset.resources?.find(
              (r) => r.format?.toLocaleLowerCase() === "sld",
            )?.url
          }
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
        <Heading level={3} className="text-theme-green font-bold mb-0">
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
    </div>
  );
}
