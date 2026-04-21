import { Resource } from "@/schemas/ckan";
import { hasOgcPreview } from "@/lib/ogc";

export const supportedPreviewFormats = [
  "csv",
  //"json",
  "pdf",
  //"xlsx",
  //"xls",
  //"kml",
  "geojson",
  "wms",
  "wfs",
  "json"
  //"shp",
];

export const supportsPreview = (res: Resource) => {
  return (
    res.iframe ||
    hasOgcPreview(res) ||
    supportedPreviewFormats.some(
      (format) => format.toLowerCase() === (res.format ?? "").toLowerCase()
    )
  );
};


export const RESOURCE_COLORS: Record<string, string> = {
  // Documents
  pdf: "#8A1C1C",
  doc: "#6E1329",
  docx: "#4F1639",

  // Tabular
  csv: "#0F5A31",
  tsv: "#0E4E3F",
  xls: "#16522E",
  xlsx: "#0E4530",

  // Structured data
  json: "#7C3E00",
  ndjson: "#6B2F00",
  xml: "#5C4200",
  rdf: "#4C3B00",
  ttl: "#3F3D00",

  // Geo / spatial
  geojson: "#003A70",
  kml: "#0A2E8A",
  kmz: "#20307D",
  shp: "#0A3C8A",
  gpkg: "#2C2E96",

  // Raster / imagery
  tif: "#5D1A7A",
  tiff: "#4C1668",
  geotiff: "#3F1459",

  // Web / text
  html: "#0F4D63",
  txt: "#4A4850",
  md: "#3E4155",

  // Archives
  zip: "#303A8A",
  "7z": "#223170",
  rar: "#172A63",

  // Images
  png: "#7A1D5C",
  jpg: "#651B6D",
  jpeg: "#4F1D76",
  svg: "#3D1F6E",

  // Services / APIs
  api: "#2E4F2E",
  wms: "#7A1F4A",
  wfs: "#124C61",

  default: "#3F4652",
};
