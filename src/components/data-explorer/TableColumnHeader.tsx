import type { Header } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import {
  ArrowDownWideNarrow,
  ArrowUpDownIcon,
  ArrowUpWideNarrow,
  Pin,
  PinOff,
} from "lucide-react";
import React, {  } from "react";
import { match } from "ts-pattern";
import { Tooltip } from "./Tooltip";



export default function TableColumnHeader<TData extends object>({
  h,
}: {
  h: Header<TData, unknown>;
}) {
  return (
    <div className="relative flex gap-x-2 items-center pr-4 text-[#6B7280]">
      <span className="uppercase text-sm font-semibold truncate">
        {flexRender(h.column.columnDef.header, h.getContext())}
      </span>

      {match(h.column.getIsSorted())
        .with(false, () => (
          <button
              type="button"
              onClick={() => h.column.toggleSorting(false, true)}
              aria-label="Sort column"
              title="Sort column"
            >
              <div className="flex flex-col items-center justify-center">
                <ArrowUpDownIcon className="w-4 h-4" />
              </div>
            </button>
        ))
        .with("asc", () => (
          <button
              type="button"
              onClick={() => h.column.toggleSorting(true, true)}
              aria-label="Sort desc"
              title="Sort desc"
            >
              <div className="flex flex-col items-center justify-center">
                <ArrowUpWideNarrow className="w-4 h-4 " />
              </div>
            </button>
     
        ))
        .with("desc", () => (
          <button
              type="button"
              onClick={() => h.column.clearSorting()}
              aria-label="Sort asc"
              title="Clear sorting"
            >
              <div className="flex flex-col items-center justify-center">
                <ArrowDownWideNarrow className="w-4 h-4 " />
              </div>
            </button>
        ))
        .otherwise(() => null)}

      {!h.isPlaceholder && h.column.getCanPin() && (
        <div className="flex gap-1 justify-center hidden">
          {h.column.getIsPinned() !== "left" ? (
            <Tooltip content="Pin to left">
              <button
                type="button"
                onClick={() => h.column.pin("left")}
                aria-label="Pin column to left"
              >
                <Pin className="w-4 h-4" />
              </button>
            </Tooltip>
          ) : (
            <Tooltip content="Unpin">
              <button
                type="button"
                onClick={() => h.column.pin(false)}
                aria-label="Unpin column"
              >
                <PinOff className="w-4 h-4" />
              </button>
            </Tooltip>
          )}
        </div>
      )}
    </div>
  );
}


