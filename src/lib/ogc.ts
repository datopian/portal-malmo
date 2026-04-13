import { Resource } from "@/schemas/ckan";

export type OgcType = "wms" | "wfs";

export type OgcPreviewConfig = {
  type: OgcType;
  resourceUrl: string;
};

function parseUrl(value: string): URL | null {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

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

export function normalizeOgcServiceUrl(
  resourceUrl: string,
  type: OgcType,
): string | null {
  const url = parseUrl(resourceUrl);
  if (!url) return null;

  const params = new URLSearchParams(url.search);
  const layerName = getParam(params, "layers", "typenames", "typename");

  deleteParams(
    params,
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
    deleteParams(params, "layers", "typenames", "typeNames", "bbox");

    if (!getParam(params, "version")) {
      params.set("version", "2.0.0");
    }

    if (layerName) {
      params.set("typename", layerName);
    }
  } else {
    deleteParams(params, "typenames", "typeNames", "typename");

    if (layerName) {
      params.set("layers", layerName);
    }
  }

  url.search = params.toString();
  return url.toString();
}

export function getOgcPreviewConfig(
  resource: Resource,
): OgcPreviewConfig | null {
  if (resource.wfs_url) {
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
  }

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
