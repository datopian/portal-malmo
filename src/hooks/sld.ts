"use client";

import { useEffect, useState } from "react";
import L from "leaflet";

export function useSldStyler(sldXml: string) {
  const [styler, setStyler] = useState<L.SLDStyler | null>(null);

  useEffect(() => {
    let mounted = true;
    const normalizedSldXml = sanitizeSldXml(sldXml);

    const tryCreate = () => {
      if ("SLDStyler" in L) {
        const s = new L.SLDStyler(normalizedSldXml);
        if (mounted) setStyler(s);
      } else {
        setTimeout(tryCreate, 50);
      }
    };

    tryCreate();

    return () => {
      mounted = false;
    };
  }, [sldXml]);

  return styler;
}


export function sanitizeSldXml(input: string): string {
  if (!input.includes("PropertyIsLike")) return input;
  try {
    const doc = new DOMParser().parseFromString(input, "application/xml");
    if (doc.getElementsByTagName("parsererror").length) return input;

    const OGC_NS = "http://www.opengis.net/ogc";
    const nodes = Array.from(doc.getElementsByTagNameNS(OGC_NS, "PropertyIsLike"));

    for (const n of nodes) {
      const singleChar = n.getAttribute("singleChar");
      if (singleChar === ".") n.setAttribute("singleChar", "?");

      if (!n.getAttribute("wildCard")) n.setAttribute("wildCard", "*");
      if (!n.getAttribute("escapeChar")) n.setAttribute("escapeChar", "!");
    }

    return new XMLSerializer().serializeToString(doc);
  } catch {
    return input;
  }
}
