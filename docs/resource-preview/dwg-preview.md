# DWG Preview

The DWG preview flow is intentionally simple:

1. CKAN receives a DWG resource ID
2. the backend stages the DWG into a temporary file
3. ODA File Converter converts `DWG -> DXF`
4. `ezdxf` renders the selected DXF layout to `PDF`
5. the backend returns that PDF conversion result
6. the frontend can display the converted result, or derive a later SVG preview from it if that flow is reintroduced

## Frontend files

- `src/components/package/resource/DwgPreview.tsx`
- `src/components/package/resource/SimplePdfViewer.tsx`
- `src/components/package/resource/ResourcePreview.tsx`

## Backend files

- `src/ckanext-malmo/ckanext/malmo/dwg_preview.py`
- `src/ckanext-malmo/ckanext/malmo/views.py`
- `src/ckanext-malmo/ckanext/malmo/logic/action.py`

## Endpoint

The CKAN helper in `src/lib/ckan/api.ts` builds the conversion URL with the
resource ID as a query parameter:

```text
/api/3/action/convert_dwg?id=<resource-id>
```

This is a `GET` URL with no JSON request body. The backend receives the trusted
resource ID, stages the DWG, runs the conversion pipeline, and returns the PDF
conversion result.
