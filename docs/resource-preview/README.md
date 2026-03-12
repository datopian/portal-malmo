## Resource Preview

The resource preview is rendered by `ResourcePreview` and chooses the viewer based on `resource.format`, `resource.url`, and `resource.datastore_active`.

Main entry:
- `src/components/package/resource/ResourcePreview.tsx`

### Format routing logic

1. `wms` / `wfs`
- Uses `OgcServiceMapPreview`.
- Input: `resource.url`.

2. `geojson`
- Uses `GeoJsonViewer`.
- If the dataset also has an `sld` resource, its URL is passed as `styleUrl`.

3. `json`
- Uses `JsonUrlViewer`.

4. `datastore_active = true`
- Uses `DataExplorer` (CKAN datastore SQL-based table view), regardless of file format.

5. `csv`
- Uses `CSVExplorerWrapper`.

6. `pdf`
- Uses `SimplePdfViewer` (client-side `react-pdf`).

7. Fallback
- If `resource.iframe` is true, uses `IframeWrapper`.
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

