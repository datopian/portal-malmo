## Resource Preview

The resource preview is rendered by `ResourcePreview`. Preview eligibility and
renderer selection live in `src/lib/resource-preview.ts`; keep new preview rules
there so the dataset list button and the resource page stay in sync.

Main entry:
- `src/components/package/resource/ResourcePreview.tsx`
- `src/lib/resource-preview.ts`

Related guide:
- `docs/resource-preview/dwg-preview.md`

### Format routing logic

1. `iframe = true`
- Uses `IframeWrapper`.
- Requires `resource.url`.

2. `geojson`
- Uses `GeoJsonViewer`.
- GeoJSON wins over `datastore_active`, so ingested geospatial resources still
  render as maps.
- If the dataset also has an `sld` resource, its URL is passed as `styleUrl`.

3. OGC service (`wms` / `wfs`, or `wms_url` / `wfs_url`)
- Uses `OgcServiceMapPreview`.
- Input: normalized WMS/WFS service URL.

4. `datastore_active = true`
- Uses `DataExplorer` (CKAN datastore SQL-based table view) for non-spatial
  resources.

5. `dwg`
- Uses `DwgPreview`.
- Detected from normalized format, MIME type, or `.dwg` URL extension.
- Embeds the external InnerScene DWG viewer with `resource.url`.
- The resource URL must be reachable by InnerScene.
- The current preview does not call the CKAN `convert_dwg` helper.
- Full flow is documented in `docs/resource-preview/dwg-preview.md`.

6. `json`
- Uses `JsonUrlViewer`.

7. `csv`
- Uses `CSVExplorerWrapper`.

8. `pdf`
- Uses `SimplePdfViewer` (client-side `react-pdf`).

9. `gpkg`
- Browser-side direct GeoPackage rendering is not supported.
- If the GPKG resource has OGC metadata, it uses the OGC preview.
- Otherwise, it borrows a sibling spatial preview resource from the same dataset,
  preferring GeoJSON first, then OGC. This matches Malmo datasets where the
  GPKG, Shape, CSV, and GeoJSON resources are export variants of the same layer.

10. Fallback
- Otherwise shows `Preview.notSupported`.

### GeoJSON + SLD styling

Key files:
- `src/components/package/resource/GeoJsonViewer.tsx`
- `src/components/map/SldLegend.tsx`
- `src/components/map/LeafletSldLoader.tsx`
- `src/hooks/sld` (styling hook)

How it works:
1. GeoJSON source can be:
- Raw JSON string.
- URL to fetch.
- Already parsed GeoJSON object.

2. Optional SLD source can be:
- Inline XML string.
- URL to fetch XML.

3. If SLD is valid:
- Styling functions are created via `useSldStyler`.
- Leaflet `GeoJSON` layer uses this style function.
- `SldLegend` is displayed (desktop always, mobile toggle controlled in `ResourcePreview`).

4. If SLD fails:
- Data still renders with default style.
- A non-blocking style error message is shown.

### OGC (WMS/WFS) preview

Key file:
- `src/components/package/resource/OgcServiceMapPreview.tsx`

WMS:
- Creates a WMS layer from query params.
- Supports map click -> `GetFeatureInfo`.
- Uses map CRS from `map.options.crs?.code` in requests.
- Handles WMS 1.3.x `EPSG:4326` bbox axis order correctly.

WFS:
- Calls `GetFeature` with `outputFormat=application/json`.
- Supports paging with `count` + `startIndex`.
- Has fallback when server does not support `startIndex`.
- Prevents repeated page-1 fetches in fallback mode.

### Datastore preview (Data Explorer)

Key files:
- `src/components/data-explorer/DataExplorer.tsx`
- `src/components/data-explorer/DataExplorerInner.tsx`
- `src/components/data-explorer/queryHooks.ts`

How it works:
1. Loads datastore field metadata using `datastore_info`.
2. Builds column definitions from field metadata.
3. Fetches rows using `datastore_search_sql`.
4. Supports table filtering, sorting, and pagination.

### CSV preview

Key files:
- `src/components/csv-explorer/index.tsx`
- `src/components/csv-explorer/DataProvider.tsx`

How it works:
- Loads CSV from `dataUrl`.
- Provides search and column settings.
- Renders paginated table.

### PDF preview

Key file:
- `src/components/package/resource/SimplePdfViewer.tsx`

How it works:
- Uses `react-pdf` with PDF.js worker.
- Supports page navigation and zoom.
- Optional "fit width" mode.

