import { Dataset, Resource } from "@/schemas/ckan";

import {
  OgcLinkGroup,
  OgcPreviewConfig,
  getOgcLinkGroups,
  getOgcPreviewConfig,
} from "@/lib/ogc";
import { getResourceFormat, getResourceUrlPath } from "@/lib/resource";

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
  sourceResource: Resource;
  previewKind: ResourcePreviewKind;
  ogcPreview: OgcPreviewConfig | null;
  ogcLinkGroups: OgcLinkGroup[];
  sldUrl?: string;
  hasSldLegend: boolean;
  isMapPreview: boolean;
};

const DIRECT_URL_PREVIEW_FORMATS = new Set<ResourcePreviewKind>([
  "geojson",
  "json",
  "csv",
  "pdf",
]);

function hasResourceUrl(resource: Pick<Resource, "url">) {
  return typeof resource.url === "string" && resource.url.trim().length > 0;
}

function hasDwgPreview(
  resource: Pick<Resource, "format" | "mimetype" | "url">,
) {
  const format = getResourceFormat(resource);
  const mimetype = resource.mimetype?.toLowerCase() ?? "";
  const url = getResourceUrlPath(resource.url).toLowerCase();

  return format === "dwg" || mimetype.includes("dwg") || url.endsWith(".dwg");
}

export function getDatasetSldUrl(dataset: Dataset): string | undefined {
  return dataset.resources?.find(
    (resource) => getResourceFormat(resource) === "sld",
  )?.url;
}

function isSpatialPreviewResource(resource: Resource) {
  return (
    getResourceFormat(resource) === "geojson" || !!getOgcPreviewConfig(resource)
  );
}

function getGpkgSiblingPreviewResource(
  resource: Resource,
  resources: Resource[],
) {
  const siblingResources = resources.filter(
    (candidate) => candidate.id !== resource.id,
  );

  return (
    siblingResources.find(
      (candidate) => getResourceFormat(candidate) === "geojson",
    ) ?? siblingResources.find(isSpatialPreviewResource)
  );
}

export function getPreviewSourceResource(
  resource: Resource,
  resources: Resource[] = [],
) {
  const format = getResourceFormat(resource);

  if (format !== "gpkg" || getOgcPreviewConfig(resource)) {
    return resource;
  }

  return getGpkgSiblingPreviewResource(resource, resources) ?? resource;
}

function resolveDirectUrlPreviewKind(format: string): ResourcePreviewKind {
  return DIRECT_URL_PREVIEW_FORMATS.has(format as ResourcePreviewKind)
    ? (format as ResourcePreviewKind)
    : "unsupported";
}

function resolvePreviewKind(resource: Resource): ResourcePreviewKind {
  const format = getResourceFormat(resource);
  const hasUrl = hasResourceUrl(resource);

  // Order matters. Keep this aligned with docs/resource-preview/README.md.
  if (resource.iframe && hasUrl) return "iframe";

  if (format === "geojson" && hasUrl) return "geojson";

  if (getOgcPreviewConfig(resource)) return "ogc";

  if (resource.datastore_active) return "datastore";

  if (!hasUrl) return "unsupported";

  if (hasDwgPreview(resource)) return "dwg";

  if (format === "gpkg") return "unsupported";

  const directUrlPreview = resolveDirectUrlPreviewKind(format);
  if (directUrlPreview !== "unsupported") return directUrlPreview;

  return "unsupported";
}

export function supportsPreview(resource: Resource, resources: Resource[] = []) {
  const sourceResource = getPreviewSourceResource(resource, resources);
  return resolvePreviewKind(sourceResource) !== "unsupported";
}

export function getResourcePreviewModel(
  resource: Resource,
  dataset: Dataset,
): ResourcePreviewModel {
  const sourceResource = getPreviewSourceResource(resource, dataset.resources);
  const ogcPreview = getOgcPreviewConfig(sourceResource);
  const ogcLinkGroups = getOgcLinkGroups(sourceResource);
  const previewKind = resolvePreviewKind(sourceResource);
  const supportsSldLegend =
    previewKind === "geojson" ||
    (previewKind === "ogc" && ogcPreview?.type === "wfs");
  const sldUrl = supportsSldLegend ? getDatasetSldUrl(dataset) : undefined;
  const hasSldLegend = !!sldUrl;

  return {
    sourceResource,
    previewKind,
    ogcPreview,
    ogcLinkGroups,
    sldUrl,
    hasSldLegend,
    isMapPreview: previewKind === "geojson" || previewKind === "ogc",
  };
}
