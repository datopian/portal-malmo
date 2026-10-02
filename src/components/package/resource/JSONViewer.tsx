"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { JsonViewerUI } from "@/components/json/JSONViewerUI";
import { MAX_PREVIEW_SIZE_BYTES } from "@/lib/preview-size";
import {
  ResourceTooLargeError,
  fetchTextWithSizeLimit,
} from "@/lib/size-limited-fetch";

type JsonUrlViewerProps = {
  url: string;
  className?: string;
  cache?: RequestCache;
};

function parseJson(text: string): unknown {
  return JSON.parse(text) as unknown;
}

export default function JsonUrlViewer({
  url,
  cache = "no-store",
}: JsonUrlViewerProps) {
  const t = useTranslations();
  const [src, setSrc] = useState<unknown>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    function formatErrorMessage(err: unknown): string {
      if (err instanceof ResourceTooLargeError) {
        return t("Preview.tooLargeToPreview");
      }
      if (err instanceof Error) return err.message;
      return "Failed to load JSON.";
    }

    async function load() {
      setLoading(true);
      setErrorMessage(null);

      try {
        const text = await fetchTextWithSizeLimit(
          url,
          MAX_PREVIEW_SIZE_BYTES,
          {
            method: "GET",
            cache,
            signal: controller.signal,
            headers: {
              Accept: "application/json",
            },
          },
        );

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
