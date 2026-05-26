import type { GeoJsonObject } from "geojson";

export type BoundingBox = [number, number, number, number];

export function parseUrlSafely(value: string): URL | null {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

export function isProbablyUrl(value: string) {
  return /^(https?:\/\/|\/|\.\/|\.\.\/)/.test(value.trim());
}

export function isProbablyXml(input: string) {
  const value = input.trim();
  return (
    value.startsWith("<?xml") ||
    value.startsWith("<StyledLayerDescriptor") ||
    value.startsWith("<sld:StyledLayerDescriptor")
  );
}

export function parseBbox(raw: string | null): BoundingBox | undefined {
  if (!raw) return undefined;

  const parts = raw.split(",").map((part) => Number(part.trim()));
  if (parts.length < 4 || parts.some((value) => !Number.isFinite(value))) {
    return undefined;
  }

  return [parts[0], parts[1], parts[2], parts[3]];
}

export function toLeafletBounds(
  bbox: BoundingBox,
): [[number, number], [number, number]] {
  const [minX, minY, maxX, maxY] = bbox;
  return [
    [minY, minX],
    [maxY, maxX],
  ];
}

/**
 * GeoJSON officially dropped the `crs` member in RFC 7946, but many spatial
 * services still include it. We read that hint when present so the UI can
 * tell whether the coordinates are already standard lon/lat or still in a
 * projected reference system such as EPSG:3008.
 */
export function getEpsgFromGeoJsonCrs(value: unknown): number | null {
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

function collectCoordinateNumbers(
  value: unknown,
  out: number[],
  limit: number,
) {
  if (out.length >= limit) return;

  if (Array.isArray(value)) {
    for (const item of value) {
      if (out.length >= limit) break;
      collectCoordinateNumbers(item, out, limit);
    }
    return;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    out.push(value);
  }
}

/**
 * Leaflet's default basemap flow expects coordinates in geographic degrees.
 * We combine the optional EPSG hint with a small coordinate sample so we can
 * decide whether a GeoJSON payload can sit on an OSM basemap or should be
 * rendered in projected space with the basemap disabled.
 */
export function isLeafletReadyGeoJson(value: GeoJsonObject): boolean {
  const epsg = getEpsgFromGeoJsonCrs(value);
  if (epsg !== null && epsg !== 4326) return false;

  const coords: number[] = [];
  collectCoordinateNumbers(value, coords, 40);

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
