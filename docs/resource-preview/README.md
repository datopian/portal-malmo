# Resource previews: developer guide

This guide explains how preview selection and rendering work. The
[WMS/WFS guide](../wms-wfs/README.md) is aimed at data publishers; this guide is
for maintaining the frontend.

## Main flow

Preview handling is split into two parts:

1. [`src/lib/resource-preview.ts`](https://github.com/datopian/portal-malmo/blob/main/src/lib/resource-preview.ts)
   decides whether a resource can be previewed and builds a
   [`ResourcePreviewModel`](https://github.com/datopian/portal-malmo/blob/main/src/lib/resource-preview.ts#L22-L30).
2. [`ResourcePreview.tsx`](https://github.com/datopian/portal-malmo/blob/main/src/components/package/resource/ResourcePreview.tsx)
   [renders the component selected by `previewKind`](https://github.com/datopian/portal-malmo/blob/main/src/components/package/resource/ResourcePreview.tsx#L45-L109).

[`supportsPreview()`](https://github.com/datopian/portal-malmo/blob/main/src/lib/resource-preview.ts#L124-L127)
uses the same selection logic outside the resource page.
Keep preview detection in `src/lib/resource-preview.ts` so links and the
resource page do not disagree.

The selection order matters:

1. Resource with `iframe: true` and a URL
2. GeoJSON with a URL
3. WFS or WMS service
4. Active CKAN DataStore resource
5. DWG
6. JSON, CSV, or PDF
7. Unsupported

For example, GeoJSON is checked before `datastore_active`, so an ingested
GeoJSON resource still opens as a map.

Formats are normalized by
[`normalizeResourceFormat()`](https://github.com/datopian/portal-malmo/blob/main/src/lib/resource.ts#L3-L17).
Do not add format aliases inside individual preview components.

## Preview model

[`getResourcePreviewModel(resource, dataset)`](https://github.com/datopian/portal-malmo/blob/main/src/lib/resource-preview.ts#L129-L152)
returns:

- `sourceResource`: the resource that will actually be rendered
- `previewKind`: the renderer to use
- `ogcPreview`: normalized WMS/WFS type and URL, when present
- `ogcLinkGroups`: service and GetCapabilities links shown below the preview
- `sldUrl`: the first SLD resource URL found in the dataset, when applicable
- `hasSldLegend`: controls the mobile legend button
- `isMapPreview`: controls the accessible map figure wrapper

### GPKG fallback

GPKG is not rendered directly in the browser. If it has WMS/WFS metadata, that
service is used. Otherwise,
[`getPreviewSourceResource()`](https://github.com/datopian/portal-malmo/blob/main/src/lib/resource-preview.ts#L65-L91)
looks for a sibling resource in the same dataset:

1. the first GeoJSON resource
2. otherwise, the first WMS/WFS resource

If neither exists, the preview is unsupported. This fallback means the
`sourceResource` can be different from the resource page being viewed.

## Standard previews

| Kind | Component | Notes |
| --- | --- | --- |
| `datastore` | [`DataExplorer.tsx`](https://github.com/datopian/portal-malmo/blob/main/src/components/data-explorer/DataExplorer.tsx#L10-L30) | Loads fields with `datastore_info`, then uses `datastore_search_sql` for filtering, sorting, and pagination. |
| `csv` | [`csv-explorer/index.tsx`](https://github.com/datopian/portal-malmo/blob/main/src/components/csv-explorer/index.tsx) | Fetches the resource URL in the browser and provides search, column settings, and pagination. |
| `json` | [`JSONViewer.tsx`](https://github.com/datopian/portal-malmo/blob/main/src/components/package/resource/JSONViewer.tsx#L21-L86) | Fetches with `cache: "no-store"`, parses JSON, and shows loading or fetch errors. |
| `pdf` | [`SimplePdfViewer.tsx`](https://github.com/datopian/portal-malmo/blob/main/src/components/package/resource/SimplePdfViewer.tsx#L68-L210) | Client-only `react-pdf` viewer with page navigation, zoom, and fit width. |
| `iframe` | [`iframe.tsx`](https://github.com/datopian/portal-malmo/blob/main/src/components/ui/iframe.tsx) | Used when CKAN sets `iframe: true` and the resource has a URL. |

These direct URL previews run in the browser. The resource server must allow the
browser to fetch or embed the URL.

## GeoJSON and SLD

Main files:

- [`GeoJsonViewer.tsx`](https://github.com/datopian/portal-malmo/blob/main/src/components/package/resource/GeoJsonViewer.tsx)
- [`useSldDocument.ts`](https://github.com/datopian/portal-malmo/blob/main/src/hooks/useSldDocument.ts)
- [`sld.ts`](https://github.com/datopian/portal-malmo/blob/main/src/hooks/sld.ts)
- [`LeafletSldLoader.tsx`](https://github.com/datopian/portal-malmo/blob/main/src/components/map/LeafletSldLoader.tsx)
- [`SldLegend.tsx`](https://github.com/datopian/portal-malmo/blob/main/src/components/map/SldLegend.tsx)
- [`geospatial.ts`](https://github.com/datopian/portal-malmo/blob/main/src/lib/geospatial.ts)

### GeoJSON loading

`GeoJsonViewer` accepts a GeoJSON object, inline JSON, or a URL. The resource
preview currently passes the resource URL.

The component:

1. parses [inline JSON](https://github.com/datopian/portal-malmo/blob/main/src/components/package/resource/GeoJsonViewer.tsx#L157-L176)
   or [fetches the URL](https://github.com/datopian/portal-malmo/blob/main/src/components/package/resource/GeoJsonViewer.tsx#L178-L205)
2. [checks that the response looks like GeoJSON](https://github.com/datopian/portal-malmo/blob/main/src/components/package/resource/GeoJsonViewer.tsx#L194-L197)
3. [renders it with React Leaflet](https://github.com/datopian/portal-malmo/blob/main/src/components/package/resource/GeoJsonViewer.tsx#L300-L328)
4. [fits the map to the layer bounds](https://github.com/datopian/portal-malmo/blob/main/src/components/package/resource/GeoJsonViewer.tsx#L329-L334)
5. [creates property popups for features](https://github.com/datopian/portal-malmo/blob/main/src/components/package/resource/GeoJsonViewer.tsx#L310-L325)

[Normal longitude/latitude data uses OpenStreetMap tiles](https://github.com/datopian/portal-malmo/blob/main/src/components/package/resource/GeoJsonViewer.tsx#L293-L298).
The [coordinate check](https://github.com/datopian/portal-malmo/blob/main/src/lib/geospatial.ts#L173-L195)
uses the optional EPSG value and a coordinate sample. When the result is not
ready for Leaflet's geographic map, the viewer uses
[`L.CRS.Simple` without the OpenStreetMap layer](https://github.com/datopian/portal-malmo/blob/main/src/components/package/resource/GeoJsonViewer.tsx#L282-L298).

### SLD loading and styling

[`getDatasetSldUrl()`](https://github.com/datopian/portal-malmo/blob/main/src/lib/resource-preview.ts#L53-L57)
selects the first dataset resource whose normalized format is `sld`. SLD is
applied to GeoJSON and WFS previews, not WMS previews.

[`useSldDocument()`](https://github.com/datopian/portal-malmo/blob/main/src/hooks/useSldDocument.ts#L12-L85)
accepts inline XML or fetches an SLD URL. A failed SLD fetch does not stop the
data from rendering; the map uses default Leaflet styling and shows a warning.

[`LeafletSldLoader`](https://github.com/datopian/portal-malmo/blob/main/src/components/map/LeafletSldLoader.tsx#L5-L12)
loads the local `public/leaflet/leaflet-sld.js` plugin.
[`useSldStyler()`](https://github.com/datopian/portal-malmo/blob/main/src/hooks/sld.ts#L6-L40)
waits for `L.SLDStyler`, creates the style function, and passes it to the
GeoJSON layer. It also
[`normalizes some PropertyIsLike attributes`](https://github.com/datopian/portal-malmo/blob/main/src/hooks/sld.ts#L45-L68)
before creating the styler.

[`SldLegend`](https://github.com/datopian/portal-malmo/blob/main/src/components/map/SldLegend.tsx#L146-L278)
builds its entries from the same styler. The legend is visible on desktop. On
mobile,
[`ResourcePreview` controls it with a show/hide button](https://github.com/datopian/portal-malmo/blob/main/src/components/package/resource/ResourcePreview.tsx#L121-L166).

When changing SLD behavior, check both the map style and legend. They share the
same SLD input but render it separately.

## WMS and WFS previews

Main files:

- [`ogc.ts`](https://github.com/datopian/portal-malmo/blob/main/src/lib/ogc.ts)
- [`OgcServiceMapPreview.tsx`](https://github.com/datopian/portal-malmo/blob/main/src/components/package/resource/OgcServiceMapPreview.tsx)
- [`ResourceOgcLinks.tsx`](https://github.com/datopian/portal-malmo/blob/main/src/components/package/resource/ResourceOgcLinks.tsx)

### Detection and URL normalization

[`getOgcPreviewConfig()`](https://github.com/datopian/portal-malmo/blob/main/src/lib/ogc.ts#L217-L246)
checks, in order:

1. `resource.wfs_url`
2. `resource.wms_url`
3. a resource with format `wfs` or `wms` and `resource.url`

[`normalizeOgcServiceUrl()`](https://github.com/datopian/portal-malmo/blob/main/src/lib/ogc.ts#L92-L154)
removes request-specific parameters, keeps the layer name, and sets the service
type. For WFS it also removes `bbox`, defaults the version to `2.0.0`, and
writes the layer as `typename`.

Layer parameter names are read case-insensitively. WMS requires `layers`; WFS
accepts `typename` or `typenames`.

[`getOgcLinkGroups()`](https://github.com/datopian/portal-malmo/blob/main/src/lib/ogc.ts#L252-L281)
separately creates the service and GetCapabilities links shown below the
preview. A resource can expose both WMS and WFS links even though only one map
preview is selected.

### WMS

The
[`WmsLayer` renderer](https://github.com/datopian/portal-malmo/blob/main/src/components/package/resource/OgcServiceMapPreview.tsx#L197-L278)
creates a Leaflet tile layer from the service URL. A tile error replaces the map
with a service/layer error.

Clicking the map
[builds and sends a `GetFeatureInfo` request](https://github.com/datopian/portal-malmo/blob/main/src/components/package/resource/OgcServiceMapPreview.tsx#L150-L195)
for one feature and shows its properties in a popup when the response is JSON.
The request uses the map CRS and handles the WMS 1.3 `EPSG:4326` axis order.

SLD is not applied in the frontend for WMS. WMS styling comes from the map
service.

### WFS

The WFS renderer
[builds a `GetFeature` request](https://github.com/datopian/portal-malmo/blob/main/src/components/package/resource/OgcServiceMapPreview.tsx#L101-L126)
as GeoJSON with `srsname=EPSG:4326`. The
[fetch loop](https://github.com/datopian/portal-malmo/blob/main/src/components/package/resource/OgcServiceMapPreview.tsx#L345-L429)
requests 1,000 features per page and stops at 5,000 features.

The loop stops when a page is short or empty, when it reaches `numberMatched`,
or when it reaches the 5,000-feature limit. The code does not detect services
that ignore `startIndex`; such a service can return duplicate pages until the
limit is reached.

The returned FeatureCollection is
[rendered as a Leaflet GeoJSON layer](https://github.com/datopian/portal-malmo/blob/main/src/components/package/resource/OgcServiceMapPreview.tsx#L520-L564).
It uses the same SLD styling, legend, property popups, and
projected-coordinate fallback as the GeoJSON preview.

WFS requests happen in the browser, so CORS must allow the portal origin.

## DWG

Main file:

- [`DwgPreview.tsx`](https://github.com/datopian/portal-malmo/blob/main/src/components/package/resource/DwgPreview.tsx)

DWG is
[detected from the normalized format, MIME type, or a `.dwg` URL path](https://github.com/datopian/portal-malmo/blob/main/src/lib/resource-preview.ts#L42-L51).
The component
[builds and embeds the InnerScene URL](https://github.com/datopian/portal-malmo/blob/main/src/components/package/resource/DwgPreview.tsx#L42-L49)
with the encoded resource URL.

The
[load and timeout handling](https://github.com/datopian/portal-malmo/blob/main/src/components/package/resource/DwgPreview.tsx#L52-L74)
shows a loader, waits two seconds after the iframe load event, and shows an
error if it has not loaded within ten seconds. InnerScene
[chooses its language from the browser language](https://github.com/datopian/portal-malmo/blob/main/src/components/package/resource/DwgPreview.tsx#L131-L151),
not the portal locale.

This preview depends on InnerScene being available and able to fetch the public
DWG URL. The current UI does not use
[`CKAN.getDwgPreviewUrl()`](https://github.com/datopian/portal-malmo/blob/main/src/lib/ckan/api.ts#L397-L404)
or the CKAN `convert_dwg` endpoint.

See [the focused DWG guide](dwg-preview.md) for a shorter description.

## Adding or changing a preview

When adding a preview type:

1. Add the kind to
   [`ResourcePreviewKind`](https://github.com/datopian/portal-malmo/blob/main/src/lib/resource-preview.ts#L11-L20).
2. Add detection to
   [`resolvePreviewKind()`](https://github.com/datopian/portal-malmo/blob/main/src/lib/resource-preview.ts#L99-L122)
   in the correct priority position.
3. Add its renderer to
   [`PreviewRenderer`](https://github.com/datopian/portal-malmo/blob/main/src/components/package/resource/ResourcePreview.tsx#L45-L109).
4. Update
   [the preview model flags](https://github.com/datopian/portal-malmo/blob/main/src/lib/resource-preview.ts#L129-L152),
   SLD handling, or OGC links if the new type needs them.
5. Add translations for loading, errors, labels, and controls in all three
   files under
   [`messages/`](https://github.com/datopian/portal-malmo/tree/main/messages).
6. Update this guide and test a real CKAN resource.

When changing an existing preview:

- Keep detection out of the renderer.
- Preserve abort and cleanup logic for browser requests and Leaflet layers.
- Keep failures local to the preview; an optional style or popup failure should
  not break the resource page.
- Check mobile layout and keyboard-accessible controls.
- Run `npm run build` and `npm run test:e2e`.

There are currently no focused unit tests for preview selection, OGC URL
normalization, or SLD styling. Test the affected format manually with a real
resource, including an invalid URL or missing layer parameter where relevant.

## Quick troubleshooting

- **Preview button is missing:** check
  [`supportsPreview()`](https://github.com/datopian/portal-malmo/blob/main/src/lib/resource-preview.ts#L124-L127)
  and
  [format normalization](https://github.com/datopian/portal-malmo/blob/main/src/lib/resource.ts#L3-L20).
- **Wrong preview opens:** check the priority in
  [`resolvePreviewKind()`](https://github.com/datopian/portal-malmo/blob/main/src/lib/resource-preview.ts#L99-L122)
  and the selected
  [`sourceResource`](https://github.com/datopian/portal-malmo/blob/main/src/lib/resource-preview.ts#L129-L152).
- **GeoJSON/WFS data does not load:** inspect the browser request, response
  shape, and CORS headers.
- **SLD warning appears:** open the SLD URL directly and check that it returns
  XML. The data should still render without the style.
- **WMS tiles fail:** check the service URL, layer name, version, and
  GetCapabilities link.
- **WFS stops early:** check whether the service supports `startIndex` and
  whether it returns `numberMatched`.
- **DWG times out:** check that InnerScene is reachable and can access the
  resource URL.
