# DWG preview

The current frontend previews DWG resources with the external InnerScene DWG
viewer.

## Current flow

1. `src/lib/resource-preview.ts` detects DWG from the normalized format, MIME
   type, or `.dwg` URL extension.
2. `ResourcePreview` passes the public resource URL to `DwgPreview`.
3. `DwgPreview` opens `https://www.innerscene.com/tools/dwg-viewer` in an iframe
   and sends the encoded resource URL in its `url` query parameter.
4. The component shows a loader and replaces it with an error message if the
   iframe does not load within 10 seconds.

The InnerScene language is chosen from the browser language when that language
is supported by InnerScene. It is not taken from the portal URL locale.

## Requirements and limitations

- The resource must have a URL.
- InnerScene must be able to reach that URL.
- The preview depends on an external service and iframe support.
- The frontend does not call the CKAN conversion endpoint when rendering the
  current DWG preview.

`src/lib/ckan/api.ts` still contains `getDwgPreviewUrl()`, which builds
`/api/3/action/convert_dwg?id=<resource-id>`, but the current preview components
do not call this helper.

## Main files

- `src/lib/resource-preview.ts`
- `src/components/package/resource/ResourcePreview.tsx`
- `src/components/package/resource/DwgPreview.tsx`
