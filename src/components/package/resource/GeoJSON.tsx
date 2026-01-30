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
import type { GeoJSON as LeafletGeoJSON } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useTranslations } from "next-intl";
import { escapeHtml } from "@/lib/utils";

const DefaultIcon = L.Icon.Default as unknown as {
  prototype: { _getIconUrl?: unknown };
};
delete DefaultIcon.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  iconUrl: "/leaflet/marker-icon.png",
  shadowUrl: "/leaflet/marker-shadow.png",
});

type Props = {
  data: GeoJsonObject | string;
  padding?: [number, number];
  maxZoom?: number;
};

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

function isProbablyUrl(value: string) {
  return /^(https?:\/\/|\/|\.\/|\.\.\/)/.test(value.trim());
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

type LoadState = "idle" | "loading" | "ready" | "error";

function formatProperties(props: Record<string, unknown> | null | undefined) {
  if (!props || typeof props !== "object") return "<em>No attributes</em>";

  return `
    <div class="text-sm space-y-1">
      ${Object.entries(props)
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

/* detect EPSG from optional GeoJSON crs (RFC 7946 ignores crs, but files still include it) */
function getEpsgFromGeoJsonCrs(value: unknown): number | null {
  if (!value || typeof value !== "object") return null;

  const crs = (value as Record<string, unknown>).crs;
  if (!crs || typeof crs !== "object") return null;

  const props = (crs as Record<string, unknown>).properties;
  if (!props || typeof props !== "object") return null;

  const name = (props as Record<string, unknown>).name;
  if (typeof name !== "string") return null;

  const match = name.match(/EPSG(?::|::)\s*(\d+)/i);
  if (!match?.[1]) return null;

  const epsg = Number(match[1]);
  return Number.isFinite(epsg) ? epsg : null;
}

/* sample coordinate numbers quickly (avoid walking entire huge file) */
function collectCoordinateNumbers(
  value: unknown,
  out: number[],
  limit: number,
) {
  if (out.length >= limit) return;

  if (Array.isArray(value)) {
    for (const v of value) {
      if (out.length >= limit) break;
      collectCoordinateNumbers(v, out, limit);
    }
    return;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    out.push(value);
  }
}

/* “Leaflet-ready” = lon/lat degrees (WGS84-ish). Otherwise use CRS.Simple */
function isLeafletReadyGeoJson(value: GeoJsonObject): boolean {
  const epsg = getEpsgFromGeoJsonCrs(value);
  if (epsg !== null && epsg !== 4326) return false;

  const coords: number[] = [];
  collectCoordinateNumbers(value as unknown, coords, 40);

  if (coords.length < 2) return true;

  let maxAbsX = 0;
  let maxAbsY = 0;

  for (let i = 0; i + 1 < coords.length; i += 2) {
    const x = coords[i] ?? 0;
    const y = coords[i + 1] ?? 0;
    maxAbsX = Math.max(maxAbsX, Math.abs(x));
    maxAbsY = Math.max(maxAbsY, Math.abs(y));
  }

  if (maxAbsX <= 180 && maxAbsY <= 90) return true;
  if (maxAbsX > 1000 || maxAbsY > 1000) return false;

  return false;
}

export default function GeoJsonMap({
  data,
  padding = [24, 24],
  maxZoom = 14,
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
        const res = await fetch(trimmed, { signal: controller.signal });
        if (!res.ok) {
          throw new Error(
            `Failed to fetch GeoJSON (${res.status} ${res.statusText})`,
          );
        }

        const json = (await res.json()) as unknown;
        if (!isGeoJsonObject(json)) {
          throw new Error("Response is not valid GeoJSON.");
        }

        setGeoJson(json);
        setState("ready");
      } catch (e) {
        if (controller.signal.aborted) return;
        setError(e instanceof Error ? e.message : "Failed to load GeoJSON.");
        setState("error");
      }
    }

    loadFromString(data);

    return () => controller.abort();
  }, [data, t]);

  const memoGeoJson = useMemo(() => geoJson, [geoJson]);

  const setLayerRef = useCallback((layer: LeafletGeoJSON | null) => {
    layerRef.current = layer;
  }, []);


  const isSimple = useMemo(() => {
    if (!memoGeoJson) return false; // TS guard
    return !isLeafletReadyGeoJson(memoGeoJson);
  }, [memoGeoJson]);

  if (state === "loading") {
    return <div className="text-sm">{t("Common.loading")}</div>;
  }

  if (state === "error") {
    return (
      <div className="text-sm text-red-600">
        {error ?? t("Common.error", { default: "Something went wrong." })}
      </div>
    );
  }

  if (!memoGeoJson) {
    return (
      <div className="text-sm text-gray-600">
        {t("Common.noData", { default: "No data found." })}
      </div>
    );
  }

  return (
    <>
    <div className="h-[550px] pr-4 md:pr-0 md:h-[600px] lg:h-[800px] w-full overflow-hidden rounded-xl">
      <MapContainer
        center={[0, 0]}
        zoom={2}
        scrollWheelZoom
        {...(isSimple
          ? {
              crs: L.CRS.Simple,
              minZoom: -10,
              maxZoom: 10,
              zoomSnap: 0.1,
              zoomDelta: 0.5,
            }
          : {})}
        style={{
          height: "100%",
          width: "100%",
        }}
      >
        {!isSimple && (
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        )}

        <RLGeoJSON
          data={memoGeoJson}
          ref={setLayerRef}
          pointToLayer={(_, latlng) => L.marker(latlng)}
          onEachFeature={(feature, layer) => {
            if (feature.properties) {
              layer.bindPopup(formatProperties(feature.properties));
            }

            layer.on("click", () => {
              layer.openPopup();
            });
          }}
        />

        <FitToGeoJson layerRef={layerRef} padding={padding} maxZoom={maxZoom} />
      </MapContainer>
    </div>
    </>
  );
}
