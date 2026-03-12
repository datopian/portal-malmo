"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import { GeoJSON, MapContainer, TileLayer, useMap } from "react-leaflet";
import type { FeatureCollection, GeoJsonProperties, Geometry } from "geojson";
import { useTranslations } from "next-intl";

import { Skeleton } from "@/components/ui/skeleton";
import { escapeHtml } from "@/lib/utils";

import "leaflet/dist/leaflet.css";

type OgcType = "wms" | "wfs";

type OgcServiceMapPreviewProps = {
  type: OgcType;
  resourceUrl: string;
};

type PreviewError = {
  title: string;
  message: string;
  details?: string;
  status?: number;
};

type ParsedOgcUrl = {
  baseUrl: string;
  query: URLSearchParams;
  layerName?: string;
  bbox?: [number, number, number, number];
};

const DEFAULT_CENTER: [number, number] = [0, 0];
const DEFAULT_ZOOM = 2;
const MAX_WFS_FEATURES = 5000;
const WFS_PAGE_SIZE = 1000;

function parseUrl(value: string): URL | null {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function parseBbox(
  raw: string | null,
): [number, number, number, number] | undefined {
  if (!raw) return undefined;
  const parts = raw.split(",").map((part) => Number(part.trim()));
  if (parts.length < 4 || parts.some((n) => !Number.isFinite(n)))
    return undefined;
  return [parts[0], parts[1], parts[2], parts[3]];
}

function parseOgcResourceUrl(resourceUrl: string): ParsedOgcUrl | null {
  const url = parseUrl(resourceUrl);
  if (!url) return null;

  const query = new URLSearchParams();
  for (const [key, value] of url.searchParams.entries()) {
    query.append(key.toLowerCase(), value);
  }

  const layerName =
    query.get("layers") ??
    query.get("typenames") ??
    query.get("typename") ??
    undefined;

  const baseUrl = `${url.origin}${url.pathname}`;

  return {
    baseUrl,
    query,
    layerName,
    bbox: parseBbox(query.get("bbox")),
  };
}

function toLeafletBounds(
  bbox: [number, number, number, number],
): [[number, number], [number, number]] {
  const [minX, minY, maxX, maxY] = bbox;
  return [
    [minY, minX],
    [maxY, maxX],
  ];
}

function FitToBbox({ bbox }: { bbox: [number, number, number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.fitBounds(toLeafletBounds(bbox), { padding: [20, 20] });
  }, [bbox, map]);

  return null;
}

function FitToGeoJson({
  data,
}: {
  data: FeatureCollection<Geometry, GeoJsonProperties> | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!data?.features.length) return;
    const layer = L.geoJSON(data);
    const bounds = layer.getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [20, 20], maxZoom: 16 });
    }
  }, [data, map]);

  return null;
}

function buildWfsUrl({
  baseUrl,
  sourceParams,
  layerName,
  count,
  startIndex,
  withStartIndex,
}: {
  baseUrl: string;
  sourceParams: URLSearchParams;
  layerName?: string;
  count: number;
  startIndex: number;
  withStartIndex: boolean;
}) {
  const query = new URLSearchParams(sourceParams.toString());

  query.set("service", "WFS");
  query.set("request", "GetFeature");
  query.set("outputFormat", "application/json");
  if (!query.get("version")) query.set("version", "2.0.0");
  if (layerName) query.set("typeNames", layerName);
  query.set("count", String(count));
  if (withStartIndex) {
    query.set("startIndex", String(startIndex));
  } else {
    query.delete("startIndex");
  }

  return `${baseUrl}?${query.toString()}`;
}

function getErrorDetails(error: unknown): PreviewError {
  if (error instanceof Error) {
    return {
      title: "error",
      message: error.message,
    };
  }

  return {
    title: "error",
    message: "Unknown error",
  };
}

function formatPropertiesPopup(
  properties: Record<string, unknown> | null | undefined,
): string | null {
  if (!properties || Object.keys(properties).length === 0) return null;

  const rows = Object.entries(properties)
    .map(([key, value]) => {
      const safeKey = escapeHtml(String(key));
      const safeValue = escapeHtml(String(value ?? ""));
      return `<div><strong>${safeKey}:</strong> ${safeValue}</div>`;
    })
    .join("");

  return `<div class="space-y-1 text-sm max-h-[300px] overflow-auto">${rows}</div>`;
}

function buildWmsGetFeatureInfoUrl(params: {
  parsed: ParsedOgcUrl;
  map: L.Map;
  latlng: L.LatLng;
}): string {
  const { parsed, map, latlng } = params;
  const query = new URLSearchParams(parsed.query.toString());
  const mapSize = map.getSize();
  const point = map.latLngToContainerPoint(latlng);
  const version = (query.get("version") ?? "1.3.0").toLowerCase();
  const crsCode = map.options.crs?.code ?? "EPSG:3857";
  const bounds = map.getBounds();
  const west = bounds.getWest();
  const south = bounds.getSouth();
  const east = bounds.getEast();
  const north = bounds.getNorth();
  const bbox =
    version.startsWith("1.3") && crsCode.toUpperCase() === "EPSG:4326"
      ? `${south},${west},${north},${east}`
      : `${west},${south},${east},${north}`;

  query.set("service", "WMS");
  query.set("request", "GetFeatureInfo");
  query.set("layers", parsed.layerName ?? "");
  query.set("query_layers", parsed.layerName ?? "");
  query.set("info_format", "application/json");
  query.set("feature_count", "1");
  query.set("width", String(mapSize.x));
  query.set("height", String(mapSize.y));
  query.set("bbox", bbox);

  if (version.startsWith("1.3")) {
    query.set("crs", crsCode);
    query.set("i", String(Math.round(point.x)));
    query.set("j", String(Math.round(point.y)));
  } else {
    query.set("srs", crsCode);
    query.set("x", String(Math.round(point.x)));
    query.set("y", String(Math.round(point.y)));
  }

  return `${parsed.baseUrl}?${query.toString()}`;
}

function buildGetCapabilitiesUrl(parsed: ParsedOgcUrl, type: OgcType): string {
  const query = new URLSearchParams(parsed.query.toString());

  query.set("service", type.toUpperCase());
  query.set("request", "GetCapabilities");

  [
    "layers",
    "query_layers",
    "typenames",
    "typename",
    "bbox",
    "count",
    "startIndex",
    "outputFormat",
    "info_format",
    "feature_count",
    "width",
    "height",
    "x",
    "y",
    "i",
    "j",
    "srs",
    "crs",
  ].forEach((param) => {
    query.delete(param);
  });

  return `${parsed.baseUrl}?${query.toString()}`;
}

type WmsLayerProps = {
  parsed: ParsedOgcUrl | null;
  type: OgcType;
  t: ReturnType<typeof useTranslations>;
  wmsLayerRef: React.MutableRefObject<L.TileLayer.WMS | null>;
  setError: React.Dispatch<React.SetStateAction<PreviewError | null>>;
  buildWmsGetFeatureInfoUrl: typeof buildWmsGetFeatureInfoUrl;
  formatPropertiesPopup: typeof formatPropertiesPopup;
};

function WmsLayer({
  parsed,
  type,
  t,
  wmsLayerRef,
  setError,
  buildWmsGetFeatureInfoUrl,
  formatPropertiesPopup,
}: WmsLayerProps) {
  const map = useMap();

  useEffect(() => {
    if (!parsed?.layerName || type !== "wms") return;

    const params = Object.fromEntries(parsed.query.entries());
    const layer = L.tileLayer.wms(parsed.baseUrl, {
      ...params,
      layers: parsed.layerName,
      format: "image/png",
      transparent: true,
    });

    wmsLayerRef.current = layer;
    layer.addTo(map);

    const onTileError = () => {
      setError({
        title: t("Map.ogc.errors.serviceFailedTitle"),
        message: t("Map.ogc.errors.invalidServiceOrLayer"),
      });
    };
    let pendingInfoRequest: AbortController | null = null;

    const onMapClick = async (event: L.LeafletMouseEvent) => {
      pendingInfoRequest?.abort();
      pendingInfoRequest = new AbortController();

      const infoUrl = buildWmsGetFeatureInfoUrl({
        parsed,
        map,
        latlng: event.latlng,
      });

      try {
        const response = await fetch(infoUrl, {
          signal: pendingInfoRequest.signal,
        });
        if (!response.ok) return;

        const contentType = response.headers.get("content-type") ?? "";
        if (!contentType.includes("json")) return;

        const payload = (await response.json()) as {
          features?: Array<{ properties?: Record<string, unknown> }>;
        };
        const props = payload.features?.[0]?.properties;
        const html = formatPropertiesPopup(props);
        if (!html) return;

        L.popup().setLatLng(event.latlng).setContent(html).openOn(map);
      } catch (err) {
        if (pendingInfoRequest.signal.aborted) return;
      }
    };

    layer.on("tileerror", onTileError);
    map.on("click", onMapClick);

    return () => {
      pendingInfoRequest?.abort();
      layer.off("tileerror", onTileError);
      map.off("click", onMapClick);
      map.removeLayer(layer);
      wmsLayerRef.current = null;
    };
  }, [
    map,
    parsed,
    t,
    type,
    wmsLayerRef,
    setError,
    buildWmsGetFeatureInfoUrl,
    formatPropertiesPopup,
  ]);

  return null;
}

export default function OgcServiceMapPreview({
  type,
  resourceUrl,
}: OgcServiceMapPreviewProps) {
  const t = useTranslations();

  const parsed = useMemo(() => parseOgcResourceUrl(resourceUrl), [resourceUrl]);
  const getCapabilitiesUrl = useMemo(
    () => (parsed ? buildGetCapabilitiesUrl(parsed, type) : resourceUrl),
    [parsed, resourceUrl, type],
  );
  const serviceUrl = resourceUrl;
  const [wfsData, setWfsData] = useState<FeatureCollection<
    Geometry,
    GeoJsonProperties
  > | null>(null);
  const [loading, setLoading] = useState(type === "wfs");
  const [error, setError] = useState<PreviewError | null>(null);
  const wmsLayerRef = useRef<L.TileLayer.WMS | null>(null);
  const wfsDataKey = useMemo(
    () => (wfsData ? JSON.stringify(wfsData) : "wfs-empty"),
    [wfsData],
  );

  const serviceInfoPanel = (
    <section
      aria-label={t("Map.ogc.serviceInfo.title")}
      className="mb-4"
    >
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div className="min-w-0 rounded-lg border border-gray-200 bg-white p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-600">
            {t("Map.ogc.serviceInfo.serviceUrlLabel")}
          </p>
          <a
            href={serviceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 block break-all text-sm text-theme-green underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-green focus-visible:ring-offset-2"
            aria-label={t("Map.ogc.serviceInfo.openInNewTab", {
              label: t("Map.ogc.serviceInfo.serviceUrlLabel"),
            })}
          >
            {serviceUrl}
          </a>
        </div>

        <div className="min-w-0 rounded-lg border border-gray-200 bg-white p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-600">
            {t("Map.ogc.serviceInfo.capabilitiesLabel")}
          </p>
          <a
            href={getCapabilitiesUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 block break-all text-sm text-theme-green underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-green focus-visible:ring-offset-2"
            aria-label={t("Map.ogc.serviceInfo.openInNewTab", {
              label: t("Map.ogc.serviceInfo.capabilitiesLabel"),
            })}
          >
            {getCapabilitiesUrl}
          </a>
        </div>
      </div>
    </section>
  );

  useEffect(() => {
    setError(null);
    setWfsData(null);
    setLoading(type === "wfs");

    if (!parsed) {
      setLoading(false);
      setError({
        title: t("Map.ogc.errors.invalidUrlTitle"),
        message: t("Map.ogc.errors.invalidUrl"),
      });
      return;
    }

    if (!parsed.layerName) {
      setLoading(false);
      setError({
        title: t("Map.ogc.errors.missingLayerTitle"),
        message:
          type === "wms"
            ? t("Map.ogc.errors.missingWmsLayer")
            : t("Map.ogc.errors.missingWfsLayer"),
      });
      return;
    }

    if (type !== "wfs") return;

    const parsedConfig = parsed;
    const controller = new AbortController();

    async function fetchWfs() {
      try {
        const features: FeatureCollection<
          Geometry,
          GeoJsonProperties
        >["features"] = [];
        let startIndex = 0;
        let supportsPagination = true;
        let stopAfterFallbackPage = false;

        while (features.length < MAX_WFS_FEATURES) {
          const remaining = MAX_WFS_FEATURES - features.length;
          const count = Math.min(WFS_PAGE_SIZE, remaining);
          const requestUrl = buildWfsUrl({
            baseUrl: parsedConfig.baseUrl,
            sourceParams: parsedConfig.query,
            layerName: parsedConfig.layerName,
            count,
            startIndex,
            withStartIndex: supportsPagination,
          });

          let res: Response;
          try {
            res = await fetch(requestUrl, { signal: controller.signal });
          } catch (networkError) {
            if (controller.signal.aborted) return;
            throw new Error(t("Map.ogc.errors.corsOrNetwork"));
          }

          if (!res.ok) {
            const bodyText = await res.text().catch(() => "");

            if (supportsPagination && startIndex > 0) {
              supportsPagination = false;
              startIndex = 0;
              features.length = 0;
              stopAfterFallbackPage = true;
              continue;
            }

            setError({
              title: t("Map.ogc.errors.serviceFailedTitle"),
              message: t("Map.ogc.errors.serviceFailed", {
                status: res.status,
              }),
              details: bodyText.slice(0, 300),
              status: res.status,
            });
            setLoading(false);
            return;
          }

          const json = (await res.json()) as unknown;
          const isFeatureCollection =
            !!json &&
            typeof json === "object" &&
            (json as { type?: string }).type === "FeatureCollection" &&
            Array.isArray((json as { features?: unknown[] }).features);

          if (!isFeatureCollection) {
            setError({
              title: t("Map.ogc.errors.invalidResponseTitle"),
              message: t("Map.ogc.errors.invalidGeoJson"),
            });
            setLoading(false);
            return;
          }

          const page = json as FeatureCollection<
            Geometry,
            GeoJsonProperties
          > & {
            numberMatched?: number | string;
          };

          features.push(...page.features);
          if (!supportsPagination && stopAfterFallbackPage) {
            break;
          }

          const rawMatched = page.numberMatched;
          const numberMatched =
            typeof rawMatched === "number"
              ? rawMatched
              : typeof rawMatched === "string"
                ? Number(rawMatched)
                : undefined;

          if (!page.features.length || page.features.length < count) break;
          if (
            Number.isFinite(numberMatched) &&
            features.length >= (numberMatched as number)
          )
            break;

          startIndex += count;
        }

        setWfsData({
          type: "FeatureCollection",
          features,
        });
      } catch (rawError) {
        if (controller.signal.aborted) return;

        const mapped = getErrorDetails(rawError);
        setError({
          title: t("Map.ogc.errors.loadFailedTitle"),
          message: mapped.message,
          details: mapped.details,
        });
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchWfs();
    return () => controller.abort();
  }, [parsed, resourceUrl, t, type]);

  if (loading) {
    return (
      <>
        {serviceInfoPanel}
        <div className="space-y-3">
          <Skeleton className="h-[320px] w-full rounded-xl" />
          <p className="text-sm text-gray-700">{t("Map.ogc.loading")}</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        {serviceInfoPanel}
        <div
          role="alert"
          aria-live="assertive"
          className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-900"
        >
          <p className="font-semibold">{error.title}</p>
          <p>{error.message}</p>
          {typeof error.status === "number" && (
            <p>
              {t("Map.ogc.debug.status")}: {error.status}
            </p>
          )}
          {error.details && <p className="break-words">{error.details}</p>}
        </div>
      </>
    );
  }

  return (
    <>
      {serviceInfoPanel}
      <div className="h-[500px] w-full overflow-hidden rounded-xl border lg:h-[800px]">
        <MapContainer
          center={DEFAULT_CENTER}
          zoom={DEFAULT_ZOOM}
          style={{ width: "100%", height: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />

          {type === "wms" && (
            <WmsLayer
              parsed={parsed}
              type={type}
              t={t}
              wmsLayerRef={wmsLayerRef}
              setError={setError}
              buildWmsGetFeatureInfoUrl={buildWmsGetFeatureInfoUrl}
              formatPropertiesPopup={formatPropertiesPopup}
            />
          )}
          {type === "wfs" && wfsData && (
            <>
              <GeoJSON
                key={wfsDataKey}
                data={wfsData}
                style={{ color: "#136f63", weight: 2, fillOpacity: 0.2 }}
                pointToLayer={(_, latlng) =>
                  L.circleMarker(latlng, {
                    radius: 4,
                    color: "#136f63",
                    fillColor: "#136f63",
                    fillOpacity: 0.6,
                  })
                }
                onEachFeature={(feature, leafletLayer) => {
                  const html = formatPropertiesPopup(
                    (feature.properties as
                      | Record<string, unknown>
                      | undefined) ?? null,
                  );
                  if (!html) return;
                  leafletLayer.bindPopup(html);
                  leafletLayer.on("click", () => leafletLayer.openPopup());
                }}
              />
              <FitToGeoJson data={wfsData} />
            </>
          )}

          {parsed?.bbox && <FitToBbox bbox={parsed.bbox} />}
        </MapContainer>
      </div>
    </>
  );
}
