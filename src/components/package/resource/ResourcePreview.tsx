"use client";

import CSVExplorerWrapper from "@/components/csv-explorer";
import { DataExplorer } from "@/components/data-explorer/DataExplorer";
//import CodeViewer from "@/components/ui/code-viewer";
import IframeWrapper from "@/components/ui/iframe";
import { Dataset, Resource } from "@/schemas/ckan";
import dynamic from "next/dynamic";

const PdfViewerClient = dynamic(() => import("./SimplePdfViewer"), {
  ssr: false,
});
const GeoJsonMap = dynamic(
  () => import("@/components/package/resource/GeoJsonViewer"),
  { ssr: false },
);

export default function ResourcePreview({
  resource,
  dataset,
}: {
  resource: Resource;
  dataset: Dataset;
}) {
  const format = resource.format?.toLowerCase() || "--";

  if(format === "geojson"){
    return <GeoJsonMap data={resource.url ?? ""} />;
  }

  if (resource.datastore_active) {
    return <div className="-mt-5"><DataExplorer resource={resource} /></div>;
  }

  switch (format) {
    case "csv":
      return <CSVExplorerWrapper dataUrl={resource.url || ""} />;

    case "pdf":
      return <PdfViewerClient url={resource.url || ""} />;

    case "geojson":
      return (
        <GeoJsonMap
          data={resource.url ?? ""}
          styleUrl={
            dataset.resources?.find(
              (r) => r.format?.toLocaleLowerCase() === "sld",
            )?.url
          }
        />
      );

    /*case "json":
      return <CodeViewer data={resource.url} label="JSON" />;*/

    default:
      if (resource.iframe) {
        return (
          <IframeWrapper
            src={resource.url || ""}
            title={resource.name}
            height={800}
          />
        );
      } else {
        return "Preview not supported";
      }
  }
}
