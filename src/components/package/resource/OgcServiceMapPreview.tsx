"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import { GeoJSON, MapContainer, TileLayer, useMap } from "react-leaflet";
import type {
  Feature,
  FeatureCollection,
  GeoJsonProperties,
  Geometry,
} from "geojson";
import type { PathOptions } from "leaflet";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

import LeafletSldLoader from "@/components/map/LeafletSldLoader";
import SldLegend from "@/components/map/SldLegend";
import { Skeleton } from "@/components/ui/skeleton";
import { useSldStyler } from "@/hooks/sld";
import { useSldDocument } from "@/hooks/useSldDocument";
import {
  isLeafletReadyGeoJson,
  toLeafletBounds,
} from "@/lib/geospatial";
import {
  parseOgcResourceUrl,
  type OgcType,
  type ParsedOgcUrl,
} from "@/lib/ogc";
import { escapeHtml } from "@/lib/utils";

import "leaflet/dist/leaflet.css";

type OgcServiceMapPreviewProps = {
  type: OgcType;
  resourceUrl: string;
  styleUrl?: string;
  showLegendOnMobile?: boolean;
};

type PreviewError = {
  title: string;
  message: string;
  details?: string;
  status?: number;
};

type RLFeature = Feature<Geometry, GeoJsonProperties>;
type RLStyleFn = (feature?: RLFeature) => PathOptions;

type WfsPage = FeatureCollection<Geometry, GeoJsonProperties> & {
  numberMatched?: number | string;
};

type WmsLayerProps = {
  parsed: ParsedOgcUrl | null;
  t: ReturnType<typeof useTranslations>;
  wmsLayerRef: React.MutableRefObject<L.TileLayer.WMS | null>;
  setError: React.Dispatch<React.SetStateAction<PreviewError | null>>;
};

const DEFAULT_CENTER: [number, number] = [0, 0];
const DEFAULT_ZOOM = 2;
const MAX_WFS_FEATURES = 5000;
const WFS_PAGE_SIZE = 1000;

function FitToBbox({
  bbox,
}: {
  bbox: [number, number, number, number];
}) {
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

function buildWfsRequestUrl({
  baseUrl,
  sourceParams,
  layerName,
  count,
  startIndex,
}: {
  baseUrl: string;
  sourceParams: URLSearchParams;
  layerName?: string;
  count: number;
  startIndex: number;
}) {
  const query = new URLSearchParams(sourceParams.toString());

  query.set("service", "WFS");
  query.set("request", "GetFeature");
  query.set("outputformat", "application/json");
  query.set("srsname", "EPSG:4326");
  if (!query.get("version")) query.set("version", "2.0.0");
  if (layerName) query.set("typename", layerName);
  query.set("count", String(count));
  query.set("startindex", String(startIndex));

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

function buildWmsGetFeatureInfoUrl({
  parsed,
  map,
  latlng,
}: {
  parsed: ParsedOgcUrl;
  map: L.Map;
  latlng: L.LatLng;
}) {
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

function WmsLayer({ parsed, t, wmsLayerRef, setError }: WmsLayerProps) {
  const map = useMap();

  useEffect(() => {
    if (!parsed?.layerName) return;

    const params = Object.fromEntries(parsed.query.entries());
    delete params.bbox;
    delete params.request;
    delete params.width;
    delete params.height;
    delete params.x;
    delete params.y;
    delete params.i;
    delete params.j;
    delete params.query_layers;
    delete params.info_format;
    delete params.feature_count;

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
        const html = formatPropertiesPopup(payload.features?.[0]?.properties);
        if (!html) return;

        L.popup().setLatLng(event.latlng).setContent(html).openOn(map);
      } catch {
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
  }, [map, parsed, setError, t, wmsLayerRef]);

  return null;
}

export default function OgcServiceMapPreview({
  type,
  resourceUrl,
  styleUrl,
  showLegendOnMobile = true,
}: OgcServiceMapPreviewProps) {
  const t = useTranslations();
  const parsed = useMemo(() => parseOgcResourceUrl(resourceUrl), [resourceUrl]);
  const [wfsData, setWfsData] = useState<FeatureCollection<
    Geometry,
    GeoJsonProperties
  > | null>(null);
  const [loading, setLoading] = useState(type === "wfs");
  const [error, setError] = useState<PreviewError | null>(null);
  const { sldXml, sldError } = useSldDocument(styleUrl, {
    enabled: type === "wfs",
  });
  const wmsLayerRef = useRef<L.TileLayer.WMS | null>(null);
  const wfsFeatureCount = wfsData?.features.length ?? 0;
  const usesProjectedCoordinates = useMemo(() => {
    if (!wfsData) return false;
    return !isLeafletReadyGeoJson(wfsData);
  }, [wfsData]);

  const styler = useSldStyler(sldXml);
  const styleFn: RLStyleFn | undefined = useMemo(() => {
    const fn = styler?.getStyleFunction();
    if (!fn) return undefined;

    return (feature?: RLFeature) => {
      if (!feature) return {};
      return fn(feature);
    };
  }, [styler]);

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

    if (type !== "wfs") {
      setLoading(false);
      return;
    }

    const parsedConfig = parsed;
    const controller = new AbortController();

    async function fetchWfs() {
      try {
        const features: WfsPage["features"] = [];
        let startIndex = 0;

        while (features.length < MAX_WFS_FEATURES) {
          const remaining = MAX_WFS_FEATURES - features.length;
          const count = Math.min(WFS_PAGE_SIZE, remaining);
          const requestUrl = buildWfsRequestUrl({
            baseUrl: parsedConfig.baseUrl,
            sourceParams: parsedConfig.query,
            layerName: parsedConfig.layerName,
            count,
            startIndex,
          });

          let response: Response;
          try {
            response = await fetch(requestUrl, { signal: controller.signal });
          } catch {
            if (controller.signal.aborted) return;
            throw new Error(t("Map.ogc.errors.corsOrNetwork"));
          }

          if (!response.ok) {
            const bodyText = await response.text().catch(() => "");
            setError({
              title: t("Map.ogc.errors.serviceFailedTitle"),
              message: t("Map.ogc.errors.serviceFailed", {
                status: response.status,
              }),
              details: bodyText.slice(0, 300),
              status: response.status,
            });
            setLoading(false);
            return;
          }

          const json = (await response.json()) as unknown;
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

          const page = json as WfsPage;
          features.push(...page.features);

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
          ) {
            break;
          }

          startIndex += count;
        }

        setWfsData({
          type: "FeatureCollection",
          features,
        });
      } catch (loadError) {
        if (controller.signal.aborted) return;

        const mapped = getErrorDetails(loadError);
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
  }, [parsed, t, type]);

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-[320px] w-full rounded-xl" />
        <p className="flex items-center gap-2 text-sm text-gray-700">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          <span>{t("Map.ogc.loading")}</span>
        </p>
      </div>
    );
  }

  if (error) {
    return (
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
    );
  }

  return (
    <div className="relative z-1">
      <LeafletSldLoader />

      <div className="relative">
        {type === "wfs" && sldError && (
          <div className="mb-2 text-sm text-amber-700">
            {sldError ?? t("Map.sld.errors.failedToLoadStyle")}
          </div>
        )}

        {type === "wfs" && sldXml && (
          <div
            className={
              showLegendOnMobile
                ? "mb-3 w-full pr-4 md:absolute md:right-4 md:top-12 md:z-[1000] md:mb-0 md:w-auto"
                : "hidden md:absolute md:right-4 md:top-12 md:z-[1000] md:block md:w-auto"
            }
          >
            <SldLegend sldXml={sldXml} className="md:shadow-lg" />
          </div>
        )}
        <div className="relative h-[400px] w-full overflow-hidden rounded-xl border md:h-[500px]">
          {type === "wfs" && (
            <div className="pointer-events-none absolute right-3 top-3 z-[1001] rounded bg-white/95 px-2 py-1 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-slate-200">
              {t("Map.featureCount", { count: wfsFeatureCount })}
            </div>
          )}

          <MapContainer
            center={DEFAULT_CENTER}
            zoom={DEFAULT_ZOOM}
            {...(usesProjectedCoordinates
              ? {
                  crs: L.CRS.Simple,
                  minZoom: -10,
                  maxZoom: 10,
                  zoomSnap: 0.1,
                  zoomDelta: 0.5,
                }
              : {})}
            style={{ width: "100%", height: "100%" }}
          >
            {!usesProjectedCoordinates && (
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
            )}

            {type === "wms" && (
              <WmsLayer
                parsed={parsed}
                t={t}
                wmsLayerRef={wmsLayerRef}
                setError={setError}
              />
            )}

            {type === "wfs" && wfsData && (
              <>
                <GeoJSON
                  data={wfsData}
                  style={styleFn ?? { color: "#136f63", weight: 2, fillOpacity: 0.2 }}
                  pointToLayer={(feature, latlng) => {
                    const style = (styleFn?.(feature) ?? {}) as PathOptions & {
                      radius?: number;
                    };
                    const radius =
                      typeof style.radius === "number" ? style.radius : 4;

                    return L.circleMarker(latlng, {
                      ...(style as L.CircleMarkerOptions),
                      radius,
                      color: style.color ?? "#136f63",
                      fillColor: style.fillColor ?? "#136f63",
                      fillOpacity: style.fillOpacity ?? 0.6,
                    });
                  }}
                  onEachFeature={(feature, leafletLayer) => {
                    const html = formatPropertiesPopup(
                      (feature.properties as Record<string, unknown> | undefined) ??
                        null,
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
      </div>
    </div>
  );
}
