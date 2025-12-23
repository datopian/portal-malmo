"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { GeoJSON as RLGeoJSON, MapContainer, TileLayer, useMap } from "react-leaflet";
import type { GeoJsonObject } from "geojson";
import type { GeoJSON as LeafletGeoJSON } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useTranslations } from "next-intl";

type Props = {
  data: GeoJsonObject | string; // string can be URL or raw JSON string
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
    if (!bounds.isValid()) return;

    map.fitBounds(bounds, { padding, maxZoom });
  }, [map, layerRef, padding, maxZoom]);

  return null;
}

function isProbablyUrl(value: string) {
  // supports https://, http://, /path, ./path, ../path
  return /^(https?:\/\/|\/|\.\/|\.\.\/)/.test(value.trim());
}

function safeParseGeoJson(value: string): GeoJsonObject | null {
  try {
    const parsed = JSON.parse(value) as unknown;
    if (parsed && typeof parsed === "object" && "type" in (parsed as Record<string, unknown>)) {
      return parsed as GeoJsonObject;
    }
    return null;
  } catch {
    return null;
  }
}

export default function GeoJsonMap({ data, padding = [24, 24], maxZoom = 14 }: Props) {
  const t = useTranslations();
  const layerRef = useRef<LeafletGeoJSON | null>(null);
  const [geoJson, setGeoJson] = useState<GeoJsonObject | null>(
    typeof data === "string" ? null : data
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setError(null);

      if (typeof data !== "string") {
        setGeoJson(data);
        return;
      }

      const trimmed = data.trim();

      // raw JSON string?
      const parsed = safeParseGeoJson(trimmed);
      if (parsed) {
        setGeoJson(parsed);
        return;
      }

      // URL/path -> fetch
      if (!isProbablyUrl(trimmed)) {
        setError("GeoJSON string is not valid JSON and doesn't look like a URL/path.");
        return;
      }

      try {
        const res = await fetch(trimmed);
        if (!res.ok) throw new Error(`Failed to fetch GeoJSON: ${res.status} ${res.statusText}`);

        const json = (await res.json()) as GeoJsonObject;
        if (!cancelled) setGeoJson(json);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load GeoJSON");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [data]);

  const memoGeoJson = useMemo(() => geoJson, [geoJson]);

  return memoGeoJson ? (
    <div className="h-[420px] w-full overflow-hidden rounded-xl">
      <MapContainer center={[0, 0]} zoom={2} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {memoGeoJson && (
          <>
            <RLGeoJSON
              data={memoGeoJson}
              ref={(layer) => {
                layerRef.current = layer;
              }}
            />
            <FitToGeoJson layerRef={layerRef} padding={padding} maxZoom={maxZoom}  />
          </>
        )}
      </MapContainer>

      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  ): (
    <div className="text-sm">{t("Common.loading")}</div>
  );
}
