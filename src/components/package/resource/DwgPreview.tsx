"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import SimplePdfViewer from "./SimplePdfViewer";

type Props = {
  url: string;
  resourceName: string;
  className?: string;
};

export default function DwgPreview({ url, className }: Readonly<Props>) {
  const t = useTranslations();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;
    let blobUrl: string | null = null;

    const loadPreview = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(await getPreviewErrorMessage(response, t));
        }

        const blob = await response.blob();
        if (!blob.size || !blob.type.includes("pdf")) {
          throw new Error("The preview service returned an unexpected response.");
        }

        blobUrl = URL.createObjectURL(blob);
        if (!isCancelled) {
          setPreviewUrl(blobUrl);
          setErrorMessage(null);
          setIsLoading(false);
        }
      } catch (error) {
        if (!isCancelled) {
          setPreviewUrl(null);
          setErrorMessage(error instanceof Error ? error.message : null);
          setIsLoading(false);
        }
      }
    };

    setPreviewUrl(null);
    setErrorMessage(null);
    setIsLoading(true);
    loadPreview();

    return () => {
      isCancelled = true;
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [url]);

  if (isLoading) {
    return (
      <div className={["overflow-hidden border bg-background max-h-[85vh]", className]
        .filter(Boolean)
        .join(" ")}>
        <div className="p-4 text-sm">{t("Common.loading")}</div>
      </div>
    );
  }

  if (errorMessage || !previewUrl) {
    return (
      <div className={["overflow-hidden border bg-background max-h-[85vh]", className]
        .filter(Boolean)
        .join(" ")}>
        <div className="space-y-2 p-4 text-sm">
          <div>{t("Preview.failedToLoadDwg")}</div>
          {errorMessage && (
            <div className="rounded border border-amber-300 bg-amber-50 px-3 py-2 text-amber-900">
              {errorMessage}
            </div>
          )}
        </div>
      </div>
    );
  }

  return <SimplePdfViewer url={previewUrl} className={className} initialFitWidth />;
}

async function getPreviewErrorMessage(
  response: Response,
  t: ReturnType<typeof useTranslations>,
) {
  try {
    const payload = await response.json();
    const previewReason = payload?.error?.preview_reason?.[0];
    if (typeof previewReason === "string") {
      const mapped = getTranslatedPreviewReason(previewReason, t);
      if (mapped) return mapped;
    }

    const conversionMessage = payload?.error?.conversion?.[0];
    if (typeof conversionMessage === "string" && conversionMessage.trim()) {
      return conversionMessage;
    }
  } catch {
    // Ignore JSON parsing errors and use the generic fallback below.
  }

  return t("Preview.dwgPreviewUnavailable");
}

function getTranslatedPreviewReason(
  reason: string,
  t: ReturnType<typeof useTranslations>,
) {
  switch (reason) {
    case "modelspace_too_complex":
      return t("Preview.dwgPreviewTooDetailed");
    case "preview_unavailable":
      return t("Preview.dwgPreviewUnavailable");
    default:
      return null;
  }
}
