// WfsBboxLayer.tsx
import React from "react"
import { GeoJSON, useMapEvents } from "react-leaflet"
import type { Map as LeafletMap } from "leaflet"

type GeoJson = GeoJSON.FeatureCollection

type Props = {
  wfsBaseUrl: string
  typeName: string // e.g. "workspace:layer"
  // Optional controls
  maxFeatures?: number
  debounceMs?: number
  minZoom?: number
}

function buildWfsBboxUrl(params: {
  wfsBaseUrl: string
  typeName: string
  bbox: [number, number, number, number] // minx,miny,maxx,maxy
  maxFeatures?: number
}) {
  const { wfsBaseUrl, typeName, bbox, maxFeatures } = params

  const u = new URL(wfsBaseUrl)

  // Keep existing query params, add/override WFS ones:
  u.searchParams.set("service", "WFS")
  u.searchParams.set("version", "2.0.0")
  u.searchParams.set("request", "GetFeature")
  u.searchParams.set("typeNames", typeName)
  u.searchParams.set("outputFormat", "application/json")

  // Use EPSG:4326 to keep bbox in lon/lat; many servers support it.
  // If your server requires EPSG:3857, see note below.
  u.searchParams.set("srsName", "EPSG:4326")

  // bbox expects: minx,miny,maxx,maxy,CRS
  u.searchParams.set("bbox", `${bbox.join(",")},EPSG:4326`)

  if (typeof maxFeatures === "number") {
    // WFS 2.0.0 uses "count"
    u.searchParams.set("count", String(maxFeatures))
  }

  return u.toString()
}

export function WfsBboxLayer({
  wfsBaseUrl,
  typeName,
  maxFeatures = 5000,
  debounceMs = 250,
  minZoom = 6,
}: Props) {
  const abortRef = React.useRef<AbortController | null>(null)
  const timerRef = React.useRef<number | null>(null)

  const [data, setData] = React.useState<GeoJson | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const fetchForCurrentView = React.useCallback(
    async (map: LeafletMap) => {
      setError(null)

      // Optional: don’t fetch when too zoomed out (avoids huge responses)
      if (map.getZoom() < minZoom) {
        setData(null)
        return
      }

      // Abort previous request
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      // Leaflet bounds are lat/lng. WFS bbox in EPSG:4326 expects lon/lat.
      const b = map.getBounds()
      const west = b.getWest()
      const south = b.getSouth()
      const east = b.getEast()
      const north = b.getNorth()

      // minx,miny,maxx,maxy in lon/lat
      const bbox: [number, number, number, number] = [west, south, east, north]

      const url = buildWfsBboxUrl({
        wfsBaseUrl,
        typeName,
        bbox,
        maxFeatures,
      })

      try {
        const res = await fetch(url, { signal: controller.signal })
        if (!res.ok) throw new Error(`WFS failed (${res.status})`)
        const json = (await res.json()) as GeoJson
        setData(json)
      } catch (e: unknown) {
        if (controller.signal.aborted) return

        if (e instanceof Error) {
            setError(e.message)
        } else {
            setError("Unknown WFS error")
        }
        }
    },
    [wfsBaseUrl, typeName, maxFeatures, minZoom]
  )

  useMapEvents({
    load(e) {
      // initial fetch
      fetchForCurrentView(e.target)
    },
    moveend(e) {
      // debounce on pan/zoom end
      if (timerRef.current) window.clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(() => fetchForCurrentView(e.target), debounceMs)
    },
    zoomend(e) {
      if (timerRef.current) window.clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(() => fetchForCurrentView(e.target), debounceMs)
    },
  })

  React.useEffect(() => {
    // cleanup on unmount
    return () => {
      abortRef.current?.abort()
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [])

  if (error) {
    // You can replace this with a toast, etc.
    console.warn(error)
  }

  if (!data) return null

  const dataKey = React.useMemo(
    () => data ? JSON.stringify(data.features?.length) + Date.now() : '',
    [data]
  )

  return (
    <GeoJSON
      key={dataKey}
      data={data}
      style={() => ({
        weight: 1,
        fillOpacity: 0.15,
      })}
      
    />
  )
}
