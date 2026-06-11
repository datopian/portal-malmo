"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useLocale, useTranslations } from "next-intl";

import CSVExplorerWrapper from "@/components/csv-explorer";
import { DataExplorer } from "@/components/data-explorer/DataExplorer";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import IframeWrapper from "@/components/ui/iframe";
import { ckan } from "@/lib/ckan";
import { getLocalizedText } from "@/lib/ckan-translations";
import {
  getResourcePreviewModel,
  type ResourcePreviewKind,
} from "@/lib/resource-preview";
import { Dataset, Resource } from "@/schemas/ckan";

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
  const t = useTranslations();
  const [externalViewerUrl, setExternalViewerUrl] = React.useState<string>("");
  const [showIframeLoader, setShowIframeLoader] = React.useState(true);
  const [iframeLoaded, setIframeLoaded] = React.useState(false);
  const innerScene = "https://www.innerscene.com";
  React.useEffect(() => {
    setShowIframeLoader(true);
    setIframeLoaded(false);

    setExternalViewerUrl(
      `${innerScene}/pt/tools/dwg-viewer?embedded=1&url=${encodeURIComponent(resource.url ?? "")}`,
    );
  }, [resource.url]);

  React.useEffect(() => {
    if (!externalViewerUrl || !iframeLoaded) return;

    const timer = window.setTimeout(() => {
      setShowIframeLoader(false);
    }, 2000);

    return () => window.clearTimeout(timer);
  }, [externalViewerUrl, iframeLoaded]);

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
      return (
        <div className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <p>{t("Preview.externalPreviewInstructions")}</p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-sm border bg-background">
            {showIframeLoader && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3 px-4 text-center">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-theme-green" />
                  <p className="text-sm text-muted-foreground">
                    {t("Common.loading")}
                  </p>
                </div>
              </div>
            )}

            <iframe
              title={t("Preview.dwgPreviewLabel", { name: resourceName })}
              src={externalViewerUrl}
              className="w-full aspect-video border-0"
              allowFullScreen
              onLoad={() => setIframeLoaded(true)}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
            <p>
              {t.rich("Preview.externalPreviewAttribution", {
                link: (chunks) => (
                  <a
                    href="https://www.innerscene.com/tools/dwg-viewer#faq"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-theme-green underline underline-offset-2"
                  >
                    {chunks}
                  </a>
                ),
              })}
            </p>
          </div>
        </div>
      );

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
