"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import L from "leaflet";
import {
  GeoJSON as RLGeoJSON,
  MapContainer,
  TileLayer,
  useMap,
} from "react-leaflet";
import type { GeoJsonObject } from "geojson";
import type { Feature, GeoJsonProperties, Geometry } from "geojson";
import type { GeoJSON as LeafletGeoJSON } from "leaflet";
import type { PathOptions } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";

import LeafletSldLoader from "@/components/map/LeafletSldLoader";
import SldLegend from "@/components/map/SldLegend";
import { useSldStyler } from "@/hooks/sld";
import { useSldDocument } from "@/hooks/useSldDocument";
import {
  isProbablyUrl,
  isLeafletReadyGeoJson,
} from "@/lib/geospatial";
import { escapeHtml } from "@/lib/utils";

type RLFeature = Feature<Geometry, GeoJsonProperties>;
type RLStyleFn = (feature?: RLFeature) => PathOptions;
type LoadState = "idle" | "loading" | "ready" | "error";

type Props = {
  data: GeoJsonObject | string;
  padding?: [number, number];
  maxZoom?: number;
  styleUrl?: string;
  showLegendOnMobile?: boolean;
};

const DefaultIcon = L.Icon.Default as unknown as {
  prototype: { _getIconUrl?: unknown };
};
delete DefaultIcon.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  iconUrl: "/leaflet/marker-icon.png",
  shadowUrl: "/leaflet/marker-shadow.png",
});

function FitToGeoJson({
  layerRef,
  padding = [24, 24],
  maxZoom = 14,
}: {
  layerRef: React.RefObject<LeafletGeoJSON | null>;
  padding?: [number, number];
  maxZoom?: number;
}) {
  const map = useMap();

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    const bounds = layer.getBounds();
    if (!bounds?.isValid()) return;

    map.fitBounds(bounds, { padding, maxZoom });
  }, [map, layerRef, padding, maxZoom]);

  return null;
}

function safeParseGeoJson(value: string): GeoJsonObject | null {
  try {
    const parsed = JSON.parse(value) as unknown;
    if (
      parsed &&
      typeof parsed === "object" &&
      "type" in (parsed as Record<string, unknown>)
    ) {
      return parsed as GeoJsonObject;
    }
    return null;
  } catch {
    return null;
  }
}

function formatProperties(
  properties: Record<string, unknown> | null | undefined,
  noAttributesLabel: string,
) {
  if (!properties || typeof properties !== "object") {
    return `<em>${escapeHtml(noAttributesLabel)}</em>`;
  }

  return `
    <div class="text-sm space-y-1">
      ${Object.entries(properties)
        .map(
          ([key, value]) =>
            `<div><strong>${escapeHtml(key)}:</strong> ${escapeHtml(String(value))}</div>`,
        )
        .join("")}
    </div>
  `;
}

function isGeoJsonObject(value: unknown): value is GeoJsonObject {
  return (
    !!value &&
    typeof value === "object" &&
    "type" in (value as Record<string, unknown>)
  );
}

function getGeoJsonFeatureCount(value: GeoJsonObject | null): number {
  if (!value) return 0;

  if (
    value.type === "FeatureCollection" &&
    Array.isArray((value as { features?: unknown[] }).features)
  ) {
    return ((value as { features?: unknown[] }).features ?? []).length;
  }

  if (value.type === "Feature") {
    return 1;
  }

  return 0;
}

export default function GeoJsonMap({
  data,
  styleUrl,
  padding = [24, 24],
  maxZoom = 14,
  showLegendOnMobile = true,
}: Props) {
  const t = useTranslations();
  const layerRef = useRef<LeafletGeoJSON | null>(null);
  const [geoJson, setGeoJson] = useState<GeoJsonObject | null>(
    typeof data === "string" ? null : data,
  );
  const [state, setState] = useState<LoadState>(
    typeof data === "string" ? "loading" : "ready",
  );
  const [error, setError] = useState<string | null>(null);
  const { sldXml, sldError } = useSldDocument(styleUrl);

  const styler = useSldStyler(sldXml ?? "");
  const styleFn: RLStyleFn | undefined = useMemo(() => {
    const fn = styler?.getStyleFunction();
    if (!fn) return undefined;

    return (feature?: RLFeature) => {
      if (!feature) return {};
      return fn(feature);
    };
  }, [styler]);

  useEffect(() => {
    if (typeof data !== "string") {
      setGeoJson(data);
      setError(null);
      setState("ready");
      return;
    }

    const controller = new AbortController();

    async function loadFromString(input: string) {
      setState("loading");
      setError(null);
      setGeoJson(null);

      const trimmed = input.trim();
      if (!trimmed) {
        setError(t("Preview.errorLoadingGeoJSON"));
        setState("error");
        return;
      }

      const parsed = safeParseGeoJson(trimmed);
      if (parsed) {
        setGeoJson(parsed);
        setState("ready");
        return;
      }

      if (!isProbablyUrl(trimmed)) {
        setError(t("Preview.errorLoadingGeoJSON"));
        setState("error");
        return;
      }

      try {
        const response = await fetch(trimmed, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(
            t("Map.geoJson.errors.failedToFetch", {
              status: response.status,
              statusText: response.statusText,
            }),
          );
        }

        const json = (await response.json()) as unknown;
        if (!isGeoJsonObject(json)) {
          throw new Error(t("Map.geoJson.errors.invalidResponse"));
        }

        setGeoJson(json);
        setState("ready");
      } catch (loadError) {
        if (controller.signal.aborted) return;
        setError(
          loadError instanceof Error
            ? loadError.message
            : t("Map.geoJson.errors.failedToLoad"),
        );
        setState("error");
      }
    }

    loadFromString(data);

    return () => controller.abort();
  }, [data, t]);

  const usesProjectedCoordinates = useMemo(() => {
    if (!geoJson) return false;
    return !isLeafletReadyGeoJson(geoJson);
  }, [geoJson]);
  const featureCount = useMemo(() => getGeoJsonFeatureCount(geoJson), [geoJson]);

  const setLayerRef = useCallback((layer: LeafletGeoJSON | null) => {
    layerRef.current = layer;
  }, []);

  if (state === "loading") {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-700">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        <span>{t("Common.loading")}</span>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="text-sm text-red-600">
        {error ?? t("Common.error", { default: "Something went wrong." })}
      </div>
    );
  }

  if (!geoJson) {
    return (
      <div className="text-sm text-gray-600">
        {t("Common.noData", { default: "No data found." })}
      </div>
    );
  }

  return (
    <div className="relative z-1">
      <LeafletSldLoader />

      {sldError && (
        <div className="mb-2 text-sm text-amber-700">
          {sldError ?? t("Map.sld.errors.failedToLoadStyle")}
        </div>
      )}

      {sldXml && (
        <div
          className={
            showLegendOnMobile
              ? "mb-3 w-full md:mb-0 md:absolute md:right-4 md:top-12 md:z-[1000] md:w-auto pr-4"
              : "hidden md:block md:absolute md:right-4 md:top-12 md:z-[1000] md:w-auto"
          }
        >
          <SldLegend sldXml={sldXml} className="md:shadow-lg" />
        </div>
      )}

      <div className="relative h-[400px] w-full overflow-hidden rounded-xl pr-4 md:h-[500px] md:pr-0">
        <div className="pointer-events-none absolute right-6 top-3 z-[1001] rounded bg-white/95 px-2 py-1 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-slate-200">
          {t("Map.featureCount", { count: featureCount })}
        </div>
        <MapContainer
          center={[0, 0]}
          zoom={2}
          scrollWheelZoom
          {...(usesProjectedCoordinates
            ? {
                crs: L.CRS.Simple,
                minZoom: -10,
                maxZoom: 10,
                zoomSnap: 0.1,
                zoomDelta: 0.5,
              }
            : {})}
          style={{ height: "100%", width: "100%" }}
        >
          {!usesProjectedCoordinates && (
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          )}

          <RLGeoJSON
            data={geoJson}
            style={styleFn}
            ref={setLayerRef}
            pointToLayer={(feature, latlng) => {
              const style = (styleFn?.(feature) ?? {}) as PathOptions & {
                radius?: number;
              };
              const radius = typeof style.radius === "number" ? style.radius : 5;

              return L.circleMarker(latlng, {
                ...(style as L.CircleMarkerOptions),
                radius,
              });
            }}
            onEachFeature={(feature, layer) => {
              if (!feature.properties) return;

              layer.bindPopup(
                formatProperties(
                  feature.properties,
                  t("Map.geoJson.noAttributes"),
                ),
              );
              layer.on("click", () => layer.openPopup());
            }}
          />

          <FitToGeoJson
            layerRef={layerRef}
            padding={padding}
            maxZoom={maxZoom}
          />
        </MapContainer>
      </div>
    </div>
  );
}
