# DWG Preview

The DWG preview flow is intentionally simple:

1. CKAN receives a DWG resource ID
2. the backend stages the DWG into a temporary file
3. ODA File Converter converts `DWG -> DXF`
4. `ezdxf` renders the selected DXF layout to `PDF`
5. the frontend fetches that PDF and displays it with `SimplePdfViewer`

## Frontend files

- `src/components/package/resource/DwgPreview.tsx`
- `src/components/package/resource/SimplePdfViewer.tsx`
- `src/components/package/resource/ResourcePreview.tsx`

## Backend files

- `src/ckanext-malmo/ckanext/malmo/dwg_preview.py`
- `src/ckanext-malmo/ckanext/malmo/views.py`
- `src/ckanext-malmo/ckanext/malmo/logic/action.py`

## Endpoint

The frontend still calls the same CKAN action endpoint:

```text
/api/3/action/dwg_preview_convert?resource_id=<id>
```

The only internal change is that the endpoint now returns `application/pdf`.
