"use client";

import { useElementWidth } from "@/hooks/element";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

type Props = {
  url: string;
  className?: string;

  initialPage?: number;
  initialZoom?: number;
  minZoom?: number;
  maxZoom?: number;
  stepZoom?: number;

  renderTextLayer?: boolean;
  renderAnnotationLayer?: boolean;

  minFitWidth?: number;
  fitPaddingPx?: number;
};

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();


export default function SimplePdfViewer({
  url,
  className,
  initialPage = 1,
  initialZoom = 1.2,
  minZoom = 0.6,
  maxZoom = 2.4,
  stepZoom = 0.2,
  renderTextLayer = false,
  renderAnnotationLayer = false,
  minFitWidth = 320,
  fitPaddingPx = 24,
}: Props) {
  const [numPages, setNumPages] = useState<number>(0);
  const [page, setPage] = useState<number>(initialPage);
  const [zoom, setZoom] = useState<number>(initialZoom);
  const [fitWidth, setFitWidth] = useState<boolean>(false);
  const t = useTranslations();

  const viewerScrollRef = useRef<HTMLDivElement | null>(null);
  const { ref: containerRef, width: containerWidth } = useElementWidth();

  useEffect(() => {
    viewerScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  useEffect(() => {
    setNumPages(0);
    setPage(initialPage);
    setZoom(initialZoom);
    setFitWidth(false);
  }, [url, initialPage, initialZoom]);

  const canPrev = page > 1;
  const canNext = numPages > 0 && page < numPages;
  const zoomDisabled = fitWidth;

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(numPages || p + 1, p + 1));

  const zoomIn = () =>
    !zoomDisabled && setZoom((z) => Math.min(maxZoom, round2(z + stepZoom)));
  const zoomOut = () =>
    !zoomDisabled && setZoom((z) => Math.max(minZoom, round2(z - stepZoom)));
  const zoomReset = () => !zoomDisabled && setZoom(initialZoom);

  const pageLabel = useMemo(
    () => (!numPages ? "—" : `${page} / ${numPages}`),
    [page, numPages]
  );

  const fitWidthPx = useMemo(() => {
    if (!containerWidth) return undefined;
    return Math.max(minFitWidth, containerWidth - fitPaddingPx);
  }, [containerWidth, fitPaddingPx, minFitWidth]);

  return (
    <div className={["w-full", className].filter(Boolean).join(" ")}>
      {/* Toolbar */}
      <div className="mb-2 flex flex-wrap items-center gap-2 border bg-background p-2">
        <div className="flex items-center gap-2">
          <button
            onClick={goPrev}
            disabled={!canPrev}
            className="cursor-pointer disabled:cursor-default rounded border px-2 py-1 text-sm disabled:opacity-50"
          >
            ←
          </button>
          <button
            onClick={goNext}
            disabled={!canNext}
            className="cursor-pointer disabled:cursor-default rounded border px-2 py-1 text-sm disabled:opacity-50"
          >
            →
          </button>
          {numPages>0 && (
            <span className="text-sm tabular-nums">{pageLabel}</span>
          )}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={zoomOut}
            disabled={zoomDisabled}
            className="cursor-pointer disabled:cursor-default rounded border px-2 py-1 text-sm disabled:opacity-50"
          >
            &minus;
          </button>
          <span
            className={`w-10 text-center text-sm ${
              zoomDisabled ? "opacity-50" : ""
            }`}
          >
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={zoomIn}
            disabled={zoomDisabled}
            className="cursor-pointer disabled:cursor-default rounded border px-2 py-1 text-sm disabled:opacity-50"
          >
            +
          </button>
          <button
            onClick={zoomReset}
            disabled={zoomDisabled}
            className="cursor-pointer disabled:cursor-default rounded border px-2 py-1 text-sm disabled:opacity-50"
          >
            {t("Common.reset")}
          </button>
          <label className="ml-2 text-sm flex items-center gap-1">
            <input
              type="checkbox"
              checked={fitWidth}
              onChange={(e) => setFitWidth(e.target.checked)}
            />{" "}
            {t("Preview.fitWidth")}
          </label>
        </div>
      </div>

      {/* Viewer */}
      <div
        ref={viewerScrollRef}
        className="overflow-auto border bg-background max-h-[85vh]"
      >
        <div ref={containerRef} className="flex justify-center p-3">
          <Document
            loading={<div className="p-4 text-sm">
              {t("Common.loading")}
            </div>}
            error={<div className="p-4 text-sm ">
              {t("Preview.failedToLoad")}
            </div>}
            
            file={url}
            onLoadSuccess={(i) => setNumPages(i.numPages)}
          >
            <Page
              pageNumber={page}
              width={fitWidth ? fitWidthPx : undefined}
              scale={!fitWidth ? zoom : undefined}
              renderTextLayer={renderTextLayer}
              renderAnnotationLayer={renderAnnotationLayer}
            />
          </Document>
        </div>
      </div>

      <div className="mb-2 flex flex-wrap items-center gap-2 border bg-background p-2 mt-2">
        <div className="flex items-center gap-2 mx-auto">
          <button
            onClick={goPrev}
            disabled={!canPrev}
            className="cursor-pointer disabled:cursor-default rounded border px-2 py-1 text-sm disabled:opacity-50"
          >
            ←
          </button>
          <button
            onClick={goNext}
            disabled={!canNext}
            className="cursor-pointer disabled:cursor-default rounded border px-2 py-1 text-sm disabled:opacity-50"
          >
            →
          </button>
          {numPages>0 && (
            <span className="text-sm tabular-nums">{pageLabel}</span>
          )}
          
        </div>
      </div>
    </div>
  );
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
