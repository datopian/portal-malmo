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

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
    setPreviewSrc(url);
    setScale(initialScale);
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
        const boostedSvg = enhanceSvgForPreview(svgText);

        const blob = new Blob([boostedSvg], { type: "image/svg+xml" });
        blobUrl = URL.createObjectURL(blob);

        if (!isCancelled) {
          setPreviewSrc(blobUrl);
          setIsLoaded(false);
          setHasError(false);
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

      <div className="overflow-hidden border bg-background max-h-[85vh]">
        <figure className="min-h-[18rem] p-3">
          <figcaption className="sr-only">
            {t("Preview.dwgPreviewLabel", { name: resourceName })}
          </figcaption>

          <div className="flex min-h-[75vh] items-center justify-center overflow-auto bg-white">
            <img
              src={previewSrc}
              alt=""
              aria-hidden="true"
              className="hidden"
              onLoad={() => {
                setIsLoaded(true);
                setHasError(false);
              }}
              onError={() => {
                setHasError(true);
                setIsLoaded(false);
              }}
            />

            {isLoaded && !hasError && (
              <img
                src={previewSrc}
                alt={resourceName}
                className="block max-w-full max-h-[72vh] w-auto h-auto bg-white  select-none"
                draggable={false}
                style={{ transform: `scale(${scale})`, transformOrigin: "center center" }}
              />
            )}

            {!isLoaded && !hasError && <div className="p-4 text-sm">{t("Common.loading")}</div>}

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
