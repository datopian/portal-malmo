import * as React from "react";
import { cn } from "@/lib/utils";

type TableSkeletonProps = {
  className?: string;
  columns?: number;
  rows?: number;
  colMinWidthClass?: string;
  skeletonClassName?: string;
  showHeader?: boolean;
  ariaLabel?: string;
};

const DEFAULT_COLS = 4;
const DEFAULT_ROWS = 3;

function range(n: number): number[] {
  return Array.from({ length: n }, (_, i) => i);
}

function cellClass(colMinWidthClass: string) {
  return cn("px-4 py-4 text-base font-semibold", colMinWidthClass);
}

function bodyCellClass() {
  return "py-2 px-4";
}

export function TableSkeleton({
  className,
  columns = DEFAULT_COLS,
  rows = DEFAULT_ROWS,
  colMinWidthClass = "min-w-[200px]",
  skeletonClassName = "w-24 h-4 rounded-md bg-accent/10 animate-pulse",
  showHeader = true,
  ariaLabel = "Loading table",
}: TableSkeletonProps) {
  const colIndexes = React.useMemo(() => range(Math.max(1, columns)), [columns]);
  const rowIndexes = React.useMemo(() => range(Math.max(1, rows)), [rows]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={ariaLabel}
      className={cn(
        "max-w-full grow flex mt-5 rounded-lg border overflow-hidden",
        className,
      )}
    >
      <table className="w-full">
        {showHeader && (
          <thead className="text-left bg-[#FAFCF9] border-b">
            <tr>
              {colIndexes.map((colIndex) => {
                const isFirst = colIndex === 0;
                const isLast = colIndex === colIndexes.length - 1;

                return (
                  <th
                    // stable key
                    key={`sk-head-${colIndex}`}
                    className={cn(
                      cellClass(colMinWidthClass),
                      isFirst && "rounded-tl-lg",
                      isLast && "rounded-tr-lg",
                    )}
                  >
                    <div className="min-h-[50px] flex items-center">
                      <span className={skeletonClassName} />
                      <span className="sr-only">Loading</span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
        )}

        <tbody className="bg-white divide-y divide-slate-200">
          {rowIndexes.map((rowIndex) => (
            <tr key={`sk-row-${rowIndex}`}>
              {colIndexes.map((colIndex) => (
                <td key={`sk-cell-${rowIndex}-${colIndex}`} className={bodyCellClass()}>
                  <div className="min-h-[50px] flex items-center">
                    <span className={skeletonClassName} />
                    <span className="sr-only">Loading</span>
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
