"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

// Fix Leaflet default marker icon paths (Next.js nested routes -> 404 otherwise)
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
  data: GeoJsonObject | string; // string can be URL/path or raw JSON string
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
            `<div><strong>${key}:</strong> ${String(value)}</div>`
        )
        .join("")}
    </div>
  `;
}

export default function GeoJsonMap({
  data,
  padding = [24, 24],
  maxZoom = 14,
}: Props) {
  const t = useTranslations();
  const layerRef = useRef<LeafletGeoJSON | null>(null);

  const [geoJson, setGeoJson] = useState<GeoJsonObject | null>(
    typeof data === "string" ? null : data
  );
  const [state, setState] = useState<LoadState>(
    typeof data === "string" ? "loading" : "ready"
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // non-string: immediate
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

      // raw JSON string
      const parsed = safeParseGeoJson(trimmed);
      if (parsed) {
        setGeoJson(parsed);
        setState("ready");
        return;
      }

      // URL/path fetch
      if (!isProbablyUrl(trimmed)) {
        setError(t("Preview.errorLoadingGeoJSON"));
        setState("error");
        return;
      }

      try {
        const res = await fetch(trimmed, { signal: controller.signal });
        if (!res.ok) {
          throw new Error(
            `Failed to fetch GeoJSON (${res.status} ${res.statusText})`
          );
        }

        const json = (await res.json()) as unknown;
        if (
          !json ||
          typeof json !== "object" ||
          !("type" in (json as Record<string, unknown>))
        ) {
          throw new Error("Response is not valid GeoJSON.");
        }

        setGeoJson(json as GeoJsonObject);
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
    <div className="h-[420px] w-full overflow-hidden rounded-xl">
      <MapContainer
        center={[0, 0]}
        zoom={2}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <RLGeoJSON
          data={memoGeoJson}
          ref={(layer) => {
            layerRef.current = layer;
          }}
          pointToLayer={(feature, latlng) => L.marker(latlng)}
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
  );
}
