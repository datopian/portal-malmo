"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useLocale, useTranslations } from "next-intl";

import CSVExplorerWrapper from "@/components/csv-explorer";
import { DataExplorer } from "@/components/data-explorer/DataExplorer";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import IframeWrapper from "@/components/ui/iframe";
import { getLocalizedText } from "@/lib/ckan-translations";
import {
  getResourcePreviewModel,
  type ResourcePreviewKind,
} from "@/lib/resource-preview";
import { Dataset, Resource } from "@/schemas/ckan";

import DwgPreview from "./DwgPreview";
import JsonUrlViewer from "./JSONViewer";
import ResourceOgcLinks from "./ResourceOgcLinks";

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

type PreviewRendererProps = {
  previewKind: ResourcePreviewKind;
  resource: Resource;
  resourceName: string;
  sldUrl?: string;
  ogcPreview: ReturnType<typeof getResourcePreviewModel>["ogcPreview"];
  showLegendOnMobile: boolean;
  notSupportedLabel: string;
};

function PreviewRenderer({
  previewKind,
  resource,
  resourceName,
  sldUrl,
  ogcPreview,
  showLegendOnMobile,
  notSupportedLabel,
}: Readonly<PreviewRendererProps>) {
  switch (previewKind) {
    case "geojson":
      return (
        <GeoJsonMap
          data={resource.url ?? ""}
          styleUrl={sldUrl}
          showLegendOnMobile={showLegendOnMobile}
        />
      );

    case "ogc":
      if (!ogcPreview) return notSupportedLabel;
      return (
        <OgcServiceMapPreview
          type={ogcPreview.type}
          resourceUrl={ogcPreview.resourceUrl}
          styleUrl={ogcPreview.type === "wfs" ? sldUrl : undefined}
          showLegendOnMobile={showLegendOnMobile}
        />
      );

    case "json":
      return <JsonUrlViewer url={resource.url ?? ""} />;

    case "datastore":
      return (
        <div className="-mt-5">
          <DataExplorer resource={resource} />
        </div>
      );

    case "csv":
      return <CSVExplorerWrapper dataUrl={resource.url ?? ""} />;

    case "dwg":
      if (typeof resource.url !== "string" || !resource.url.trim()) {
        return notSupportedLabel;
      }

      return <DwgPreview url={resource.url} resourceName={resourceName} />;

    case "pdf":
      return <PdfViewerClient url={resource.url ?? ""} />;

    case "iframe":
      return (
        <IframeWrapper
          src={resource.url ?? ""}
          title={resourceName}
          height={800}
        />
      );

    default:
      return notSupportedLabel;
  }
}

export default function ResourcePreview({
  resource,
  dataset,
}: Readonly<{
  resource: Resource;
  dataset: Dataset;
}>) {
  const t = useTranslations();
  const locale = useLocale();
  const [showMobileLegend, setShowMobileLegend] = React.useState(false);
  const resourceName = getLocalizedText(
    resource.name_translated,
    locale,
    resource.name,
  );
  const preview = React.useMemo(
    () => getResourcePreviewModel(resource, dataset),
    [resource, dataset],
  );

  const previewContent = (
    <PreviewRenderer
      previewKind={preview.previewKind}
      resource={resource}
      resourceName={resourceName}
      sldUrl={preview.sldUrl}
      ogcPreview={preview.ogcPreview}
      showLegendOnMobile={showMobileLegend}
      notSupportedLabel={t("Preview.notSupported")}
    />
  );

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-3">
        <Heading level={2} className="text-theme-green mb-0 font-bold">
          {t("Common.preview")}
        </Heading>
        {preview.hasSldLegend && (
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

      {preview.isMapPreview ? (
        <figure>
          <figcaption className="sr-only">
            {t("Preview.mapPreviewLabel", { name: resourceName })}
          </figcaption>
          {previewContent}
        </figure>
      ) : (
        previewContent
      )}

      <ResourceOgcLinks
        ogcLinkGroups={preview.ogcLinkGroups}
        sldUrl={preview.sldUrl}
      />
    </div>
  );
}
