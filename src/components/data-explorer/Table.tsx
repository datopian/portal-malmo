import type { Table as TableType } from "@tanstack/react-table";
import React, {  } from "react";
import { ExpandableCell } from "./ExpandableCell";
import type { DataExplorerColumnFilter } from "./DataExplorerInner";
import clsx from "clsx";
import TableColumnHeader from "./TableColumnHeader";

type CellValue = string | number | null | undefined;

type TableProps<TData extends object> = {
  table: TableType<TData>;
  numOfRows: number;
  isLoading: boolean;
  columnFilters: DataExplorerColumnFilter[];
};

export function Table<TData extends object>({
  table,
  isLoading,
}: TableProps<TData>) {
  const numOfColumns = table.getAllColumns().length;

  const hasPinnedColumns = table.getIsSomeColumnsPinned();

  return (
    <div className="max-w-full grow flex rounded-tl-lg rounded-tr-lg border rounded-bl-lg rounded-br-lg">
      {hasPinnedColumns && (
        <table className="block border-r border-gray-200 ">
          <thead className="text-left bg-[#FAFCF9] border-b">
            {table.getLeftHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h, index) => {
                  const isFirst = index === 0;
                  return (
                    <th
                      key={h.id}
                      className={clsx(
                        "px-4 min-w-[200px] py-4 text-base font-semibold",
                        isFirst && "rounded-tl-lg"
                      )}
                    >
                      <TableColumnHeader h={h} />
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          <tbody className="bg-white divide-y divide-slate-200">
            {table.getRowModel().rows.map((r) => (
              <tr key={r.id} className="">
                {r.getLeftVisibleCells().map((c) => (
                  <td key={c.id} className="py-2 px-4">
                    <div className="min-h-[50px] flex items-center text-base">
                      <ExpandableCell content={c.getValue() as CellValue} />
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className=" overflow-x-auto w-full ">
        <table className="w-full ">
          <thead className="text-left bg-[#FAFCF9] border-b">
            {table.getCenterHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h, index) => {
                  const isFirst = index === 0;
                  const isLast = index === hg.headers.length - 1;

                  return (
                    <th
                      key={h.id}
                      className={clsx(
                        "px-4 min-w-[200px] py-4 text-base font-semibold whitespace-nowrap max-w-[480px]",
                        isFirst && !hasPinnedColumns && "rounded-tl-lg",
                        isLast && "rounded-tr-lg"
                      )}
                    >
                      <TableColumnHeader h={h} />
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          {isLoading && (
            <tbody className="bg-white divide-y divide-slate-200">
              {Array.from({ length: 10 }).map((_, r) => (
                <tr key={r} className="">
                  {Array.from({ length: numOfColumns }).map((_, c) => (
                    <td key={c} className="py-2 px-4">
                      <div className="min-h-[50px] flex items-center text-base">
                        <span className="w-24 h-4 animate-pulse rounded-md bg-accent/5" />
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          )}

          <tbody className="bg-white divide-y divide-slate-200">
            {table.getRowModel().rows.map((r) => (
              <tr key={r.id} className="">
                {r.getCenterVisibleCells().map((c, index) => {
                  const v = c.getValue();
                  const isFirst = index === 0;
                  const isLast = index ===  r.getCenterVisibleCells().length -1;

                  if (v === "" || v === " ") {
                    return (
                      <td key={c.id} className={clsx(
                        "py-2 px-4  hover:bg-accent/5",
                        isFirst && !hasPinnedColumns && "rounded-bl-lg",
                        isLast && !hasPinnedColumns && "rounded-br-lg"
                      )}>
                        <div className="min-h-[50px] flex items-center text-base">
                          {c.column.columnDef.meta?.default?.toString() ?? ""}
                        </div>
                      </td>
                    );
                  }

                  return (
                    <td key={c.id} className={clsx(
                        "py-2 px-4  hover:bg-accent/5",
                        isFirst && !hasPinnedColumns && "rounded-bl-lg",
                        isLast && !hasPinnedColumns && "rounded-br-lg"

                      )}>
                      <div className="min-h-[50px] flex items-center text-base">
                        <ExpandableCell content={v as CellValue} />
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
