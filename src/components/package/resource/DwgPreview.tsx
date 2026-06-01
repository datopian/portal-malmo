"use client";

import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

type Props = {
  url: string;
  resourceName: string;
  className?: string;
  initialScale?: number;
  minScale?: number;
  maxScale?: number;
  wheelStep?: number;
};

export default function DwgPreview({
  url,
  resourceName,
  className,
  initialScale = 1,
  minScale = 0.75,
  maxScale = 8,
  wheelStep = 0.15,
}: Props) {
  const t = useTranslations();
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [previewSrc, setPreviewSrc] = useState(url);
  const [scale, setScale] = useState(initialScale);
  const [isSuspiciousSvg, setIsSuspiciousSvg] = useState(false);

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
    setPreviewSrc(url);
    setScale(initialScale);
    setIsSuspiciousSvg(false);
  }, [url, initialScale]);

  useEffect(() => {
    let isCancelled = false;
    let blobUrl: string | null = null;

    const buildBoostedSvg = async () => {
      try {
        const response = await fetch(url, { credentials: "include" });
        if (!response.ok) return;

        const contentType = response.headers.get("content-type") || "";
        if (!contentType.includes("svg")) return;

        const svgText = await response.text();
        const suspicious = detectSuspiciousDwgSvg(svgText);
        const boostedSvg = enhanceSvgForPreview(svgText);

        const blob = new Blob([boostedSvg], { type: "image/svg+xml" });
        blobUrl = URL.createObjectURL(blob);

        if (!isCancelled) {
          setPreviewSrc(blobUrl);
          setIsLoaded(false);
          setHasError(false);
          setIsSuspiciousSvg(suspicious);
        }
      } catch {
        // Keep original URL if preprocessing fails.
      }
    };

    buildBoostedSvg();

    return () => {
      isCancelled = true;
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [url]);

  return (
    <div className={["w-full", className].filter(Boolean).join(" ")}>
      <div className="mb-2 flex flex-wrap items-center gap-2 border bg-background p-2">
        <div className="ml-auto flex items-center gap-2">
          <span className="w-14 text-center text-sm">{Math.round(scale * 100)}%</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setScale((s) => Math.max(minScale, s - wheelStep))}
            aria-label={t("Preview.zoomOut")}
          >
            &minus;
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setScale((s) => Math.min(maxScale, s + wheelStep))}
            aria-label={t("Preview.zoomIn")}
          >
            +
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => setScale(initialScale)}>
            {t("Common.reset")}
          </Button>
        </div>
      </div>

      {isSuspiciousSvg && (
        <div className="mb-2 border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {t("Preview.dwgPreviewMayBeInaccurate")}
        </div>
      )}

      <div className="overflow-hidden border bg-background max-h-[85vh]">
        <figure className="min-h-[18rem] p-3">
          <figcaption className="sr-only">
            {t("Preview.dwgPreviewLabel", { name: resourceName })}
          </figcaption>

          <div className="relative flex min-h-[75vh] items-center justify-center overflow-auto bg-white">
            {!hasError && (
              <img
                src={previewSrc}
                alt={resourceName}
                className={[
                  "block max-w-full max-h-[72vh] w-auto h-auto bg-white select-none transition-opacity duration-150",
                  isLoaded ? "opacity-100" : "opacity-0",
                ].join(" ")}
                draggable={false}
                style={{ transform: `scale(${scale})`, transformOrigin: "center center" }}
                onLoad={(event) => {
                  const imageElement = event.currentTarget;
                  if (
                    detectSuspiciousImageDimensions(
                      imageElement.naturalWidth,
                      imageElement.naturalHeight,
                    )
                  ) {
                    setIsSuspiciousSvg(true);
                  }

                  // Wait one paint frame so we hide loading only when image is actually rendered.
                  requestAnimationFrame(() => {
                    setIsLoaded(true);
                    setHasError(false);
                  });
                }}
                onError={() => {
                  setHasError(true);
                  setIsLoaded(false);
                }}
              />
            )}

            {!isLoaded && !hasError && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-4 text-sm">
                {t("Common.loading")}
              </div>
            )}

            {hasError && <div className="p-4 text-sm">{t("Preview.failedToLoadDwg")}</div>}
          </div>
        </figure>
      </div>
    </div>
  );
}

function enhanceSvgForPreview(svgText: string) {
  const hasStyle = svgText.includes("ckan-dwg-preview-stroke-style");
  const styleBlock =
    '<style id="ckan-dwg-preview-stroke-style">svg path,svg line,svg polyline,svg polygon,svg circle,svg ellipse,svg use{stroke:#111 !important;stroke-width:1.6px !important;vector-effect:non-scaling-stroke !important;stroke-linecap:round;stroke-linejoin:round;stroke-opacity:1 !important;}</style>';

  if (hasStyle) return svgText;

  if (svgText.includes("</defs>")) {
    return svgText.replace("</defs>", `</defs>${styleBlock}`);
  }

  return svgText.replace(/<svg\b[^>]*>/i, (rootTag) => `${rootTag}${styleBlock}`);
}

function detectSuspiciousDwgSvg(svgText: string) {
  const viewBoxMatch = svgText.match(
    /viewBox="(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)"/i,
  );

  const viewBoxWidth = viewBoxMatch ? Number(viewBoxMatch[3]) : 0;
  const viewBoxHeight = viewBoxMatch ? Number(viewBoxMatch[4]) : 0;

  const hasExtremeCoords = /(^|[\s,>])\d{12,}(?:\.\d+)?(?=$|[\s,<"])/.test(svgText);
  const drawableCount = (
    svgText.match(/<(path|line|polyline|polygon|circle|ellipse|text)\b/gi) || []
  ).length;

  const hugeCanvas = viewBoxWidth > 1_000_000 || viewBoxHeight > 1_000_000;
  const verySparse =
    viewBoxWidth > 0 && viewBoxHeight > 0
      ? drawableCount / (viewBoxWidth * viewBoxHeight) < 1e-10
      : false;

  return hugeCanvas || hasExtremeCoords || verySparse;
}

function detectSuspiciousImageDimensions(width: number, height: number) {
  if (!width || !height) return false;
  const maxDimension = Math.max(width, height);
  const minDimension = Math.min(width, height);
  const ratio = maxDimension / Math.max(1, minDimension);

  return maxDimension > 8000 || ratio > 25;
}
