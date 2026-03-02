"use client";

import React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

const ReactJson = dynamic(
  () => import("@microlink/react-json-view").then((mod) => mod.default),
  { ssr: false, loading: () => <div className="flex text-sm">Loading...</div>}  
);

type JsonViewerUIProps = {
  src: unknown;

  errorMessage?: string | null;
  isLoading?: boolean;
  isFetching?: boolean;

  showFooter?: boolean;

  start?: number;
  end?: number;
  total?: number;
  totalLabel?: string | number;

  pageSize?: number;
  pageSizeOptions?: number[];
  canPrevious?: boolean;
  canNext?: boolean;

  onPageSizeChange?: (nextSize: number) => void;
  onPreviousPage?: () => void;
  onNextPage?: () => void;
};

function isObjectOrArray(value: unknown): value is Record<string, unknown> | unknown[] {
  if (value == null) return false;
  return typeof value === "object" || Array.isArray(value);
}

export function JsonViewerUI({
  src,
  errorMessage,
  isLoading = false,
  isFetching = false,

  showFooter = true,

  start = 0,
  end = 0,
  total = 0,
  totalLabel = "…",

  pageSize = 10,
  pageSizeOptions = [10, 20, 50, 100],
  canPrevious = false,
  canNext = false,

  onPageSizeChange,
  onPreviousPage,
  onNextPage,
}: JsonViewerUIProps) {
  const safeSrc = isObjectOrArray(src) ? src : [];

  return (
    <div className="mt-2">
      {errorMessage ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {errorMessage}
        </div>
      ) : null}

      <div className="mt-3 overflow-auto rounded-md border bg-background p-3 min-h-[58px]">
        {isLoading ? (
          <div className="text-sm text-muted-foreground flex items-center justify-between w-full">
            Loading…
            
          </div>
        ) : (
          <ReactJson
            src={safeSrc as never}
            name={null}
            collapsed={2}
            enableClipboard
            displayDataTypes={false}
            displayObjectSize
            indentWidth={4}
            style={{ fontSize: "13px", lineHeight: "1.5" }}
          />
        )}
      </div>

      {showFooter ? (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-4 px-4">
          <span className="text-base font-regular leading-5 text-[#3E3E3E] flex items-center gap-3">
            <label className="flex items-center gap-2">
              <span className="text-xs">Rows per page</span>
              <select
                className="h-9 rounded-md border bg-background px-2 text-sm"
                value={pageSize}
                onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
                disabled={!onPageSizeChange}
              >
                {pageSizeOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </label>

            {isFetching && !isLoading ? (
              <span className="text-xs">Updating…</span>
            ) : null}
          </span>

          <div className="flex items-center gap-x-3">
            <span className="flex text-sm">
              {start} - {Math.min(end, total)} of {totalLabel}
            </span>

            <button
              type="button"
              className={cn("cursor-pointer", !canPrevious ? "opacity-25" : "opacity-100")}
              onClick={onPreviousPage}
              disabled={!canPrevious || isLoading || !onPreviousPage}
              aria-label="Previous page"
            >
              <ChevronLeftIcon size={24} />
            </button>

            <button
              type="button"
              className={cn("cursor-pointer", !canNext ? "opacity-25" : "opacity-100")}
              onClick={onNextPage}
              disabled={!canNext || isLoading || !onNextPage}
              aria-label="Next page"
            >
              <ChevronRightIcon size={24} />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
