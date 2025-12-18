import { Resource } from "@/schemas/ckan";

export const supportedPreviewFormats = [
  "csv",
  "json",
  "pdf",
  //"xlsx",
  //"xls",
  //"kml",
  //"geojson",
  //"shp",
];

export const supportsPreview = (res: Resource) => {
  return (
    res.iframe ||
    supportedPreviewFormats.some(
      (format) => format.toLowerCase() === (res.format ?? "").toLowerCase()
    )
  );
};


export const RESOURCE_COLORS: Record<string, string> = {
  // Documents (reds)
  pdf:  "#B53D25",
  doc:  "#A73721",
  docx: "#98311D",

  // Tabular (greens)
  csv:  "#3F6035",
  tsv:  "#38562F",
  xls:  "#2E5227",
  xlsx: "#284722",

  // Structured data (amber/yellow family, darkened)
  json:   "#9F6B1B",
  ndjson: "#A56917",
  xml:    "#857638",
  rdf:    "#7A6A2B",
  ttl:    "#887528",

  // Geo / spatial (navy / teal family)
  geojson: "#012C43",
  kml:     "#01364F",
  kmz:     "#01415E",
  shp:     "#014D6A",
  gpkg:    "#015A76",

  // Raster / imagery (purples)
  tif:     "#72256C",
  tiff:    "#64205F",
  geotiff: "#551B52",

  // Web / text (sky + neutrals, but dark enough)
  html: "#2F4F73",
  txt:  "#7F7268",
  md:   "#7E7165",

  // Archives (indigos)
  zip: "#454D9B",
  "7z": "#3C448B",
  rar: "#333B7B",

  // Images (violet variants)
  png:  "#7A2D8A",
  jpg:  "#6E297D",
  jpeg: "#612570",
  svg:  "#552164",

  // Services / APIs (sage family, darkened)
  api: "#4F6B5D",
  wms: "#60796C",
  wfs: "#5E7B6C",

  default: "#6E7470",
};