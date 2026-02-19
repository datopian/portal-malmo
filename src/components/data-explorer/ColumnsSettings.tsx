"use client";
"use client";
import type { Table as TableType } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { CheckIcon, XIcon } from "lucide-react";
import { useTranslations } from "next-intl";

export function ColumnsSettings<TData extends object>({
  table,
}: {
  table: TableType<TData>;
}) {
  const t = useTranslations();
  const [q, setQ] = useState("");

  const filteredItems = useMemo(() => {
    const all = table.getAllLeafColumns();
    if (!q) return all;

    const qq = q.toLowerCase();
    return all.filter((column) => {
      if (column.id.toLowerCase().includes(qq)) return true;
      const header = column.columnDef.header;
      return typeof header === "string" && header.toLowerCase().includes(qq);
    });
  }, [q, table]);

  return (
    <div
      className="flex flex-col"
      aria-label={t("DataExplorer.columnVisibilityOptions")}
    >
      <div>
        <div className="space-y-2">
          <span className=" block font-medium ">
            {t("Preview.columns")} ({filteredItems.length})
          </span>

          <div className="grid grid-cols-1 pt-2 pb-3">
            <input
              className="col-start-1 row-start-1 block w-full rounded-md bg-white py-1.5 pl-3 pr-10 sm:pr-9 border outline-blue-900"
              placeholder={t("Preview.searchColumnsPlaceholder")}
              aria-label={t("DataExplorer.searchColumnsAria")}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              autoFocus
            />
            {q.length > 0 && (
              <button
                type="button"
                className="col-start-1 row-start-1 mr-1 self-center justify-self-end"
                aria-label={t("DataExplorer.clearColumnSearchInput")}
                onClick={() => setQ("")}
              >
                <XIcon size={18} />
              </button>
            )}
          </div>

          {q === "" && (
            <div className="flex items-center">
              <input
                id="resource-preview-column-checkall"
                type="checkbox"
                checked={table.getIsAllColumnsVisible()}
                onChange={table.getToggleAllColumnsVisibilityHandler()}
                className="hidden"
              />
              <label
                htmlFor="resource-preview-column-checkall"
                tabIndex={0}
                className={`h-5 w-5 min-w-[1.25rem] flex items-center justify-center rounded border-2 cursor-pointer ${
                  table.getIsAllColumnsVisible()
                    ? "bg-primary border-primary text-white"
                    : "bg-white border-gray-200"
                } transition-colors`}
                onKeyDown={(e) => {
                  if (e.key === " " || e.key === "Enter") {
                    e.preventDefault();
                    table.getToggleAllColumnsVisibilityHandler()(
                      !table.getIsAllColumnsVisible()
                    );
                  }
                }}
              >
                {table.getIsAllColumnsVisible() && <CheckIcon width={16} />}
                <span className="sr-only">{t("Preview.checkAllColumns")}</span>
              </label>
              <span
                onClick={table.getToggleAllColumnsVisibilityHandler()}
                className="ml-3 font-medium cursor-pointer flex gap-1 w-full"
              >
                {t("Common.checkAll")}
              </span>
            </div>
          )}

          <div className="max-h-[240px] overflow-y-auto">
            {filteredItems.length === 0 && (
              <div className=" text-sm ">
                {t("DataExplorer.noColumnResults")}{" "}
                <span className="underline italic font-medium">{q}</span>
              </div>
            )}

            {filteredItems.map((column, index) => {
              const header = column.columnDef.header;
              const label = typeof header === "string" ? header : column.id;

              const active = column.getIsVisible();
              const pinned = column.getIsPinned();

              return (
                <div
                  key={column.id}
                  className={`flex items-center group  py-2 hover:bg-primary-100 ${
                    pinned ? "bg-primary-100 font-medium" : ""
                  }`}
                >
                  <div className="flex justify-between w-full">
                    <input
                      id={`resource-preview-column-${column}-${index}`}
                      type="checkbox"
                      checked={active}
                      onChange={column.getToggleVisibilityHandler()}
                      className="hidden"
                    />
                    <label
                      htmlFor={`resource-preview-column-${column}-${index}`}
                      tabIndex={0}
                      className={`h-5 w-5 min-w-[1.25rem] flex items-center justify-center rounded border-2 cursor-pointer ${
                        active
                          ? "bg-primary border-primary text-white"
                          : "bg-white border-gray-200"
                      } transition-colors`}
                      onKeyDown={(e) => {
                        if (e.key === " " || e.key === "Enter") {
                          e.preventDefault();
                          column.getToggleVisibilityHandler()(e);
                        }
                      }}
                    >
                      {active && <CheckIcon width={16} />}
                      <span className="sr-only">{label}</span>
                    </label>
                    <span
                      onClick={(e) =>
                        column.getToggleVisibilityHandler()(e)
                      }
                      className="ml-3 text-[#5F5F5F] cursor-pointer flex gap-1 w-full break-all"
                    >
                      {label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
}
