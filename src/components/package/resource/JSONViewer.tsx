"use client";

import { JsonViewerUI } from "@/components/json/JSONViewerUI";
import { useEffect, useState } from "react";

type JsonUrlViewerProps = {
  url: string;
  className?: string;
  cache?: RequestCache;
};

function formatErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return "Failed to load JSON.";
}

function parseJson(text: string): unknown {
  return JSON.parse(text) as unknown;
}

export default function JsonUrlViewer({
  url,
  cache = "no-store",
}: JsonUrlViewerProps) {
  const [src, setSrc] = useState<unknown>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setErrorMessage(null);

      try {
        const res = await fetch(url, {
          method: "GET",
          cache,
          signal: controller.signal,
          headers: {
            Accept: "application/json",
          },
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status} ${res.statusText || ""}`.trim());
        }

        const text = await res.text();
        const parsed = parseJson(text);
        const safeForViewer =
          parsed != null &&
          (typeof parsed === "object" || Array.isArray(parsed))
            ? parsed
            : { value: parsed };

        if (!mounted) return;

        setSrc(safeForViewer);
      } catch (err: unknown) {
        if (!mounted) return;
        if (err instanceof Error && err.name === "AbortError") return;

        setSrc([]);
        setErrorMessage(formatErrorMessage(err));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [url, cache]);

  return (
    <JsonViewerUI
      src={src}
      isLoading={loading}
      errorMessage={errorMessage}
      isFetching={false}
      showFooter={false}
    />
  );
}
