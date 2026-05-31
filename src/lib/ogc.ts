import { Resource } from "@/schemas/ckan";
import { BoundingBox, parseBbox, parseUrlSafely } from "@/lib/geospatial";

export type OgcType = "wms" | "wfs";

export type OgcPreviewConfig = {
  type: OgcType;
  resourceUrl: string;
};

export type ParsedOgcUrl = {
  baseUrl: string;
  query: URLSearchParams;
  layerName?: string;
  bbox?: BoundingBox;
};

export type OgcLinkGroup = {
  type: OgcType;
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

function getParam(params: URLSearchParams, ...names: string[]) {
  const normalizedNames = names.map((name) => name.toLowerCase());

  for (const [key, value] of params.entries()) {
    if (normalizedNames.includes(key.toLowerCase())) {
      return value;
    }
  }

  return null;
}

function deleteParams(params: URLSearchParams, ...names: string[]) {
  const normalizedNames = names.map((name) => name.toLowerCase());
  const keysToDelete = Array.from(params.keys()).filter((key) =>
    normalizedNames.includes(key.toLowerCase()),
  );

  for (const key of keysToDelete) {
    params.delete(key);
  }
}

function createLowerCaseQuery(params: URLSearchParams) {
  const normalized = new URLSearchParams();

  for (const [key, value] of params.entries()) {
    normalized.append(key.toLowerCase(), value);
  }

  return normalized;
}

function stripOgcNoise(params: URLSearchParams) {
  for (const key of OGC_NOISY_PARAMS) {
    params.delete(key);
  }
}

function removeLayerSelectors(params: URLSearchParams, type: OgcType) {
  if (type === "wms") {
    deleteParams(params, "layers");
    return;
  }

  deleteParams(params, "typename", "typenames", "typeNames");
}

export function normalizeOgcServiceUrl(
  resourceUrl: string,
  type: OgcType,
): string | null {
  const url = parseUrlSafely(resourceUrl);
  if (!url) return null;

  const params = new URLSearchParams(url.search);
  const layerName = getParam(params, "layers", "typenames", "typename");

  deleteParams(
    params,
    "service",
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
    "count",
    "startindex",
    "maxfeatures",
    "outputformat",
    "resulttype",
  );

  params.set("service", type.toUpperCase());

  if (type === "wfs") {
    // Some CKAN-provided WFS URLs include a bbox filter that can be stale or
    // use an axis order GeoServer interprets differently, which returns an
    // empty feature collection. The preview should query the layer itself.
    deleteParams(
      params,
      "layers",
      "typenames",
      "typename",
      "typeNames",
      "bbox",
    );

    if (!getParam(params, "version")) {
      params.set("version", "2.0.0");
    }

    if (layerName) {
      params.set("typename", layerName);
    }
  } else {
    deleteParams(params, "layers", "typenames", "typeNames", "typename");

    if (layerName) {
      params.set("layers", layerName);
    }
  }

  url.search = params.toString();
  return url.toString();
}

export function parseOgcResourceUrl(resourceUrl: string): ParsedOgcUrl | null {
  const url = parseUrlSafely(resourceUrl);
  if (!url) return null;

  const query = createLowerCaseQuery(url.searchParams);
  const layerName =
    query.get("layers") ??
    query.get("typenames") ??
    query.get("typename") ??
    undefined;

  return {
    baseUrl: `${url.origin}${url.pathname}`,
    query,
    layerName,
    bbox: parseBbox(query.get("bbox")),
  };
}

export function buildOgcGetCapabilitiesUrl(
  resourceUrl: string,
  type: OgcType,
): string | null {
  const parsed = parseOgcResourceUrl(resourceUrl);
  if (!parsed) return null;

  return buildOgcGetCapabilitiesUrlFromParsed(parsed, type);
}

export function buildOgcGetCapabilitiesUrlFromParsed(
  parsed: ParsedOgcUrl,
  type: OgcType,
): string {
  const query = new URLSearchParams(parsed.query.toString());

  stripOgcNoise(query);
  removeLayerSelectors(query, type);
  query.set("service", type.toUpperCase());
  query.set("request", "GetCapabilities");

  return `${parsed.baseUrl}?${query.toString()}`;
}

export function buildOgcServiceApiUrl(
  resourceUrl: string,
  type: OgcType,
): string | null {
  const parsed = parseUrlSafely(resourceUrl);
  if (!parsed) return null;

  const query = createLowerCaseQuery(parsed.searchParams);
  stripOgcNoise(query);
  removeLayerSelectors(query, type);
  query.set("service", type.toUpperCase());

  const queryString = query.toString();
  return queryString
    ? `${parsed.origin}${parsed.pathname}?${queryString}`
    : `${parsed.origin}${parsed.pathname}`;
}

export function getOgcPreviewConfig(
  resource: Resource,
): OgcPreviewConfig | null {
 /* if (resource.wfs_url) {
    return {
      type: "wfs",
      resourceUrl:
        normalizeOgcServiceUrl(resource.wfs_url, "wfs") ?? resource.wfs_url,
    };
  }

  if (resource.wms_url) {
    return {
      type: "wms",
      resourceUrl:
        normalizeOgcServiceUrl(resource.wms_url, "wms") ?? resource.wms_url,
    };
  }*/

  const format = resource.format?.toLowerCase();
  if ((format === "wfs" || format === "wms") && resource.url) {
    return {
      type: format,
      resourceUrl:
        normalizeOgcServiceUrl(resource.url, format) ?? resource.url,
    };
  }

  return null;
}

export function hasOgcPreview(resource: Resource) {
  return getOgcPreviewConfig(resource) !== null;
}

export function getOgcLinkGroups(resource: Resource): OgcLinkGroup[] {
  const groups: OgcLinkGroup[] = [];
  const format = resource.format?.toLowerCase();
  const candidates: Array<{ type: OgcType; url?: string }> = [
    { type: "wfs", url: resource.wfs_url ?? (format === "wfs" ? resource.url : undefined) },
    { type: "wms", url: resource.wms_url ?? (format === "wms" ? resource.url : undefined) },
  ];

  for (const candidate of candidates) {
    if (!candidate.url) continue;

    const serviceUrl = buildOgcServiceApiUrl(candidate.url, candidate.type);
    const getCapabilitiesUrl = buildOgcGetCapabilitiesUrl(
      candidate.url,
      candidate.type,
    );

    if (!serviceUrl || !getCapabilitiesUrl) continue;

    groups.push({
      type: candidate.type,
      serviceUrl,
      getCapabilitiesUrl,
    });
  }

  return groups;
}
