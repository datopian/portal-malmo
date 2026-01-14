"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const MATOMO_URL = (process.env.NEXT_PUBLIC_MATOMO_URL ?? "").replace(/\/+$/, "");
const MATOMO_SITE_ID = (process.env.NEXT_PUBLIC_MATOMO_SITE_ID ?? "").trim();

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
    _paq?: MatomoQueue;
    __matomoConfigured?: boolean;
    __matomoLoading?: Promise<void>;
  }
}

function createEnsureMatomoLoaded(matomoUrl: string, siteId: string) {
  return function ensureMatomoLoaded(): Promise<void> {
    if (!matomoUrl || !siteId) return Promise.resolve();
    if (typeof window === "undefined") return Promise.resolve();

    window._paq = window._paq ?? ([] as MatomoQueue);

    if (!window.__matomoConfigured) {
      window.__matomoConfigured = true;
      window._paq.push(["setTrackerUrl", `${matomoUrl}/matomo.php`]);
      window._paq.push(["setSiteId", siteId]);
      window._paq.push(["enableLinkTracking"]);
      // window._paq.push(["disableCookies"]); // optional
    }

    const id = "matomo-js";
    const existing = document.getElementById(id) as HTMLScriptElement | null;
    if (existing) return window.__matomoLoading ?? Promise.resolve();
    if (window.__matomoLoading) return window.__matomoLoading;

    window.__matomoLoading = new Promise<void>((resolve) => {
      const script = document.createElement("script");
      script.id = id;
      script.async = true;
      script.defer = true;
      script.src = `${matomoUrl}/matomo.js`;
      script.onload = () => resolve();

      script.onerror = () => {
        delete window.__matomoLoading;
        script.remove();
        resolve();
      };

      document.head.appendChild(script);
    });

    return window.__matomoLoading;
  };
}

function getTitleElement(): HTMLTitleElement | null {
  return document.querySelector("head > title");
}

function waitForTitleUpdate(prevTitle: string, timeoutMs = 800): Promise<string> {
  if (typeof document === "undefined") return Promise.resolve(prevTitle);

  const initial = document.title?.trim() ?? "";
  if (initial && initial !== prevTitle) return Promise.resolve(initial);

  return new Promise((resolve) => {
    const titleEl = getTitleElement();

    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      observer?.disconnect();
      resolve((document.title?.trim() ?? "") || prevTitle);
    };

    const timer = window.setTimeout(finish, timeoutMs);

    let observer: MutationObserver | null = null;

    if (titleEl) {
      observer = new MutationObserver(() => {
        const next = document.title?.trim() ?? "";
        if (next && next !== prevTitle) {
          window.clearTimeout(timer);
          finish();
        }
      });

      observer.observe(titleEl, { childList: true, subtree: true, characterData: true });
    } else {
      queueMicrotask(() => {
        const next = document.title?.trim() ?? "";
        if (next && next !== prevTitle) {
          window.clearTimeout(timer);
          finish();
        }
      });
    }
  });
}

export default function MatomoTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const ensureMatomoLoaded = useMemo(
    () => createEnsureMatomoLoaded(MATOMO_URL, MATOMO_SITE_ID),
    []
  );

  const lastTrackedUrlRef = useRef<string | null>(null);
  const lastTrackedTitleRef = useRef<string>("");

  useEffect(() => {
    void ensureMatomoLoaded();
  }, [ensureMatomoLoaded]);

  useEffect(() => {
    if (!MATOMO_URL || !MATOMO_SITE_ID) return;
    if (typeof window === "undefined") return;

    const origin = window.location.origin;
    const qs = searchParams?.toString();
    const path = qs ? `${pathname}?${qs}` : pathname;
    const url = `${origin}${path}`;

    if (lastTrackedUrlRef.current === url) return;
    lastTrackedUrlRef.current = url;

    void (async () => {
      await ensureMatomoLoaded();

      const title = await waitForTitleUpdate(lastTrackedTitleRef.current);
      lastTrackedTitleRef.current = title;

      window._paq = window._paq ?? ([] as MatomoQueue);
      window._paq.push(["setCustomUrl", url]);
      window._paq.push(["setDocumentTitle", title || document.title || url]);
      window._paq.push(["trackPageView"]);

      // debug
      // eslint-disable-next-line no-console
      console.log(title, url);
    })();
  }, [pathname, searchParams, ensureMatomoLoaded]);

  return null;
}
