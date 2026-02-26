"use client";
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
import { useTranslations } from "next-intl";



export default function TableColumnHeader<TData extends object>({
  h,
}: {
  h: Header<TData, unknown>;
}) {
  const t = useTranslations();
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
              aria-label={t("DataExplorer.sortColumn")}
              title={t("DataExplorer.sortColumn")}
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
              aria-label={t("DataExplorer.sortDesc")}
              title={t("DataExplorer.sortDesc")}
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
              aria-label={t("DataExplorer.sortAsc")}
              title={t("DataExplorer.clearSorting")}
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
            <Tooltip content={t("DataExplorer.pinToLeft")}>
              <button
                type="button"
                onClick={() => h.column.pin("left")}
                aria-label={t("DataExplorer.pinColumnToLeft")}
              >
                <Pin className="w-4 h-4" />
              </button>
            </Tooltip>
          ) : (
            <Tooltip content={t("DataExplorer.unpin")}>
              <button
                type="button"
                onClick={() => h.column.pin(false)}
                aria-label={t("DataExplorer.unpinColumn")}
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


