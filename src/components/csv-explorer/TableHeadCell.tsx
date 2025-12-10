"use client";
import { SortConfig, useResourceDataSafe } from "./DataProvider";
import { Pin } from "lucide-react";

interface TableHeadCellProps {
  col: string;
}

export default function TableHeadCell({ col: key }: TableHeadCellProps) {
  const {

    sortConfig,
    visibleColumns,
    pinnedColumns,
    setSortConfig,

  } = useResourceDataSafe();


  return (
    <th
      className={`py-2 min-w-[140px] border-0 text-left  whitespace-nowrap group  ${
        !visibleColumns.includes(key) ? "hidden" : ""
      } ${pinnedColumns.includes(key) ? "sticky left-0 z-10 bg-gray-50 " : ""}`}
      role="columnheader"
      scope="col"
    >
      <div className="flex justify-between text-left px-3  gap-2">
        <div className="flex truncate">
          <button
            onClick={() =>
              setSortConfig((prev: SortConfig) =>
                prev?.key === key && prev.direction === "asc"
                  ? { key, direction: "desc" }
                  : { key, direction: "asc" }
              )
            }
            title={key}
            className="text-sm text-left truncate font-normal text-gray-600"
          >
            <span className="uppercase font-[600]">{key}</span>{" "}
            {sortConfig?.key === key
              ? sortConfig.direction === "asc"
                ? "↑"
                : "↓"
              : ""}
          </button>
        </div>
        <PinButton col={key} />
      </div>

      {pinnedColumns.includes(key) && (
        <span className="absolute right-[0px] h-full w-[1px] bg-gray-50 top-0"></span>
      )}
    </th>
  );
}

export const PinButton = ({ col }: { col: string }) => {
  const { pinnedColumns, togglePinColumn } = useResourceDataSafe();
  return (
    <button
      onClick={() => togglePinColumn(col)}
      className={` text-left w-fit px-1 hover:bg-muted bg-white rounded shadow group-hover:opacity-[1] transition-all relative ${
        !pinnedColumns.includes(col) ? "opacity-0" : ""
      }`}
      title={"Pin this column"}
      aria-label={`Pin the column ${col}`}
    >
      <Pin width={16} />
    </button>
  );
};
