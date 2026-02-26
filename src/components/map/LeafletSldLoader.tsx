"use client";

import Script from "next/script";

export default function LeafletSldLoader() {
  return (
    <Script
      src="/leaflet/leaflet-sld.js"
      strategy="afterInteractive"
    />
  );
}
