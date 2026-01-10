"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const MATOMO_URL = (process.env.NEXT_PUBLIC_MATOMO_URL ?? "").replace(/\/+$/, "");
const MATOMO_SITE_ID = process.env.NEXT_PUBLIC_MATOMO_SITE_ID ?? "";

type MatomoCommand =
  | ["trackPageView"]
  | ["enableLinkTracking"]
  | ["setTrackerUrl", string]
  | ["setSiteId", string]
  | ["setCustomUrl", string]
  | ["setDocumentTitle", string]
  | ["disableCookies"];

type MatomoQueue = MatomoCommand[];

declare global {
  interface Window {
    _paq: MatomoQueue;
  }
}

function ensureMatomoLoaded() {
  if (!MATOMO_URL || !MATOMO_SITE_ID) return;

  window._paq = window._paq || ([] as MatomoQueue);
  window._paq.push(["setTrackerUrl", `${MATOMO_URL}/matomo.php`]);
  window._paq.push(["setSiteId", MATOMO_SITE_ID]);
  window._paq.push(["enableLinkTracking"]);

  const id = "matomo-js";
  if (document.getElementById(id)) return;

  const g = document.createElement("script");
  g.id = id;
  g.async = true;
  g.src = `${MATOMO_URL}/matomo.js`;
  document.head.appendChild(g);
}

export default function MatomoTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    ensureMatomoLoaded();
  }, []);

  useEffect(() => {
    if (!MATOMO_URL || !MATOMO_SITE_ID) return;
    if (typeof window === "undefined") return;

    window._paq = window._paq || [];

    const origin = window.location.origin;
    const qs = searchParams?.toString();
    const path = qs ? `${pathname}?${qs}` : pathname;
    const url = `${origin}${path}`;

    window._paq.push(["setCustomUrl", url]);
    window._paq.push(["setDocumentTitle", document.title]);
    window._paq.push(["trackPageView"]);

  }, [pathname, searchParams]);

  return null;
}
