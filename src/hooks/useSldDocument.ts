"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { isProbablyUrl, isProbablyXml } from "@/lib/geospatial";

type UseSldDocumentOptions = {
  enabled?: boolean;
};

export function useSldDocument(
  styleUrl?: string,
  options: UseSldDocumentOptions = {},
) {
  const { enabled = true } = options;
  const t = useTranslations();
  const [sldXml, setSldXml] = useState<string | null>(null);
  const [sldError, setSldError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !styleUrl) {
      setSldXml(null);
      setSldError(null);
      return;
    }

    const controller = new AbortController();

    async function loadSld(input: string) {
      setSldXml(null);
      setSldError(null);

      const trimmed = input.trim();
      if (!trimmed) {
        setSldError(t("Map.sld.errors.emptyStyleUrl"));
        return;
      }

      if (isProbablyXml(trimmed)) {
        setSldXml(trimmed);
        return;
      }

      if (!isProbablyUrl(trimmed)) {
        setSldError(t("Map.sld.errors.invalidStyleUrl"));
        return;
      }

      try {
        const response = await fetch(trimmed, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
            t("Map.sld.errors.failedToFetch", {
              status: response.status,
              statusText: response.statusText,
            }),
          );
        }

        const xmlText = await response.text();
        if (!isProbablyXml(xmlText)) {
          throw new Error(t("Map.sld.errors.invalidXmlResponse"));
        }

        setSldXml(xmlText);
      } catch (error) {
        if (controller.signal.aborted) return;
        setSldError(
          error instanceof Error
            ? error.message
            : t("Map.sld.errors.failedToLoad"),
        );
      }
    }

    loadSld(styleUrl);

    return () => controller.abort();
  }, [enabled, styleUrl, t]);

  return { sldXml, sldError };
}
