import { Dataset, Resource } from "@/schemas/ckan";

import {
  OgcLinkGroup,
  OgcPreviewConfig,
  getOgcLinkGroups,
  getOgcPreviewConfig,
} from "@/lib/ogc";
import { getResourceFormat, hasDwgPreview } from "@/lib/resource";

export type ResourcePreviewKind =
  | "geojson"
  | "ogc"
  | "json"
  | "datastore"
  | "csv"
  | "dwg"
  | "pdf"
  | "iframe"
  | "unsupported";

export type ResourcePreviewModel = {
  previewKind: ResourcePreviewKind;
  ogcPreview: OgcPreviewConfig | null;
  ogcLinkGroups: OgcLinkGroup[];
  sldUrl?: string;
  hasSldLegend: boolean;
  isMapPreview: boolean;
};

export function getDatasetSldUrl(dataset: Dataset): string | undefined {
  return dataset.resources?.find(
    (resource) => resource.format?.toLowerCase() === "sld",
  )?.url;
}

function resolvePreviewKind(
  resource: Resource,
  format: string,
  ogcPreview: OgcPreviewConfig | null,
): ResourcePreviewKind {
  if (format === "geojson") return "geojson";
  if (format === "gpkg") return ogcPreview ? "ogc" : "unsupported";
  if (hasDwgPreview(resource)) return "dwg";
  if (ogcPreview) return "ogc";
  if (format === "json") return "json";
  if (resource.datastore_active) return "datastore";
  if (format === "csv") return "csv";
  if (format === "pdf") return "pdf";
  if (resource.iframe) return "iframe";

  return "unsupported";
}

export function getResourcePreviewModel(
  resource: Resource,
  dataset: Dataset,
): ResourcePreviewModel {
  const format = getResourceFormat(resource);
  const ogcPreview = getOgcPreviewConfig(resource);
  const ogcLinkGroups = getOgcLinkGroups(resource);
  const previewKind = resolvePreviewKind(resource, format, ogcPreview);
  const supportsSldLegend =
    previewKind === "geojson" || (previewKind === "ogc" && ogcPreview?.type === "wfs");
  const sldUrl = supportsSldLegend ? getDatasetSldUrl(dataset) : undefined;
  const hasSldLegend = !!sldUrl;

  return {
    previewKind,
    ogcPreview,
    ogcLinkGroups,
    sldUrl,
    hasSldLegend,
    isMapPreview: previewKind === "geojson" || previewKind === "ogc",
  };
}
