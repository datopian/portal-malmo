import React from "react";
import type { DataExplorerColumnFilter } from "./DataExplorerInner";
import { formatDateToDDMMYYYY } from "@/lib/utils";

interface Column {
  key: string;
  name: string;
  type: string;
  default?: string | undefined;
}

export function TableActiveFilters({
  filters,
  columns,
}: {
  filters: DataExplorerColumnFilter[];
  setFilters: (filters: DataExplorerColumnFilter[]) => void;
  columns: Column[];
}) {
  const getColumn = (col: string) => {
    return columns?.find((c) => c.key === col);
  };

  return (
    filters.length > 0 && (
      <>
        <div className="flex flex-wrap gap-1 mb-4 items-center">
          <span className=" text-xs mr-1">Filters:</span>
          {filters.map((f,i) => {
            return (
              <div
                key={f.id+i}
                className="flex h-8 w-fit items-center gap-1 rounded-sm bg-gray-200 hover:bg-neutral-200 transition px-3 py-1 "
              >
                <div className="text-xs font-semibold leading-none text-black">
                  {getColumn(f.id)?.name}{" "}
                  <span className="text-[12px]">
                    {f.value.map((v, i) => (
                      <span key={`${f.id}-${v.value}-${i}`}>
                        <span>
                          {v.link} {v.operation?.value}{" "}
                          {getColumn(f.id)?.type === "timestamp"
                            ? formatDateToDDMMYYYY(v.value)
                            : v.value}{" "}
                        </span>
                      </span>
                    ))}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </>
    )
  );
}
