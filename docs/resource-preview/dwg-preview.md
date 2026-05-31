## DWG Preview

This document explains how DWG preview works across the portal frontend and the CKAN backend.

The current design is intentionally simple:
- the frontend requests one preview URL
- the backend returns SVG
- the backend chooses the most detailed conversion result it can produce
- the frontend displays that SVG with zoom and pan

## High-level flow

1. A user opens a resource page in the portal.
2. The portal detects that the resource is a DWG file.
3. The portal builds a CKAN preview URL for that resource.
4. CKAN loads the DWG file from uploaded storage or an external URL.
5. CKAN converts the DWG to SVG in two ways.
6. CKAN keeps the richer result.
7. The portal loads the returned SVG in the DWG viewer.
8. The user can inspect the drawing with zoom and pan.

## Frontend flow

Relevant files:
- `src/lib/resource.ts`
- `src/lib/resource-preview.ts`
- `src/lib/ckan/api.ts`
- `src/components/package/resource/ResourcePreview.tsx`
- `src/components/package/resource/DwgPreview.tsx`

### 1. DWG detection

The portal checks whether a resource looks like a DWG in `src/lib/resource.ts`.

It is treated as a DWG preview candidate when any of these are true:
- `resource.format` is `dwg`
- `resource.format` contains `dwg`
- `resource.mimetype` contains `dwg`
- `resource.url` ends with `.dwg`

That logic lives in:
- `hasDwgPreview(...)`

### 2. Preview routing

The preview system resolves a `previewKind` in `src/lib/resource-preview.ts`.

If `hasDwgPreview(resource)` is true, the resource is routed to:
- `previewKind = "dwg"`

That tells the resource page to render the dedicated DWG viewer.

### 3. Preview URL creation

The frontend helper lives in:
- `src/lib/ckan/api.ts`

It builds a single DWG preview URL:

```text
http://localhost:5000/api/3/action/dwg_preview_convert?resource_id=<id>
```

The frontend no longer chooses between output formats or conversion modes. That decision is owned by the backend.

### 4. Viewer rendering

The resource page renders `DwgPreview` from:
- `src/components/package/resource/ResourcePreview.tsx`

The viewer itself lives in:
- `src/components/package/resource/DwgPreview.tsx`

It uses:
- `react-zoom-pan-pinch`

Current behavior:
- loads the SVG returned by CKAN
- shows a loading state while the preview is being fetched
- shows an error message if the preview cannot be loaded
- supports:
  - mouse-wheel zoom
  - zoom in / zoom out buttons
  - reset
  - drag-to-pan

## Backend flow

Relevant files:
- `src/ckanext-malmo/ckanext/malmo/views.py`
- `src/ckanext-malmo/ckanext/malmo/logic/action.py`
- `src/ckanext-malmo/ckanext/malmo/dwg_preview.py`

### 1. Public endpoint

The portal calls:

```text
/api/3/action/dwg_preview_convert
```

### 2. Action layer

The action in `logic/action.py` delegates the real work to:
- `dwg_preview.build_preview_payload(...)`

### 3. Resource lookup and staging

Inside `dwg_preview.py`, the backend:
- reads `resource_id`
- loads resource metadata with `resource_show`
- checks that the resource looks like a DWG
- stages the DWG file into a temporary working directory

The DWG can come from:
- an uploaded CKAN file
- an external resource URL

This stage also applies:
- download timeout limits
- maximum file size limits

### 4. DWG to SVG conversion

The actual DWG interpretation is done by:
- `dwg2SVG`

This comes from LibreDWG.

Our CKAN code does not parse CAD geometry itself. It delegates that work to `dwg2SVG`, then post-processes the SVG output to make it easier to display in the portal.

### 5. The two conversion strategies

The backend always tries two SVG conversions:

1. normal `dwg2SVG`
2. `dwg2SVG --mspace`

In practice:
- the normal conversion is the general path
- `--mspace` asks the converter to focus on model-space only

Some drawings look better in one mode than the other, so the backend compares both and keeps the better SVG.

### 6. How “most detailed” is chosen

The backend uses a simple heuristic when comparing the two SVG files.

It prefers the result that has:
- more drawable SVG elements
- more useful SVG content overall

This is not a perfect CAD-quality metric, but it is a practical way to pick the richer preview without exposing mode selection in the frontend.

### 7. SVG normalization

After conversion, the backend normalizes the SVG before returning it.

This helps with browser embedding issues such as:
- `viewBox` origin mismatches
- root SVG tags using `width="100%" height="100%"`

That normalization is important because the SVG is displayed inside the portal viewer, not just opened in its own browser tab.

## What the endpoint returns

The endpoint returns:
- SVG content
- `image/svg+xml` as the response mimetype
- an inline filename ending in `.svg`


## Why some DWGs can still look incomplete

Even with the cleaner SVG-only flow, some DWGs can still render partially.

That is usually not caused by the portal itself.

The usual reasons are:
- limitations in `dwg2SVG`
- unsupported CAD entity types
- blocks or inserts that do not convert well
- paper-space and model-space differences
- external references not being resolved
- fonts, hatches, or CAD-specific objects not converting cleanly

So the frontend and CKAN wrapper make the preview pipeline stable, but the final level of drawing fidelity still depends on the underlying converter.

## Summary

The current DWG preview flow is:

1. Frontend detects a DWG resource.
2. Frontend requests one CKAN preview URL.
3. CKAN stages the DWG file.
4. CKAN generates two SVG candidates.
5. CKAN keeps the more detailed SVG.
6. CKAN normalizes the SVG for browser embedding.
7. Frontend displays the SVG with zoom and pan.

This keeps the user-facing behavior simple while still letting the backend choose the stronger conversion result automatically.
