"use client";

import CSVExplorerWrapper from "@/components/csv-explorer";
//import CodeViewer from "@/components/ui/code-viewer";
import IframeWrapper from "@/components/ui/iframe";
import PDFViewer from "@/components/ui/pdf-viewer";
import { Resource } from "@/schemas/ckan";
import dynamic from "next/dynamic";

const GeoJsonMap = dynamic(() => import("@/components/package/resource/GeoJSON"), { ssr: false });

export default function ResourcePreview({ resource }: { resource: Resource }) {
  const format = resource.format?.toLowerCase() || "--";

  switch (format) {
    case "csv":
      return <CSVExplorerWrapper dataUrl={resource.url || ""} />

    case "pdf":
      return (
        <PDFViewer
          src={resource.url || ""}
          title={resource.name || "PDF"}
        />
      );

    case "geojson":
      return (
        <GeoJsonMap data={resource.url??""}/>
      )

    /*case "json":
      return <CodeViewer data={resource.url} label="JSON" />;*/

    default:
      if (resource.iframe) {
        return <IframeWrapper src={resource.url || ""} title={resource.name} height={800} />;
      }else{
        return "Preview not supported"
      }
  }
}
