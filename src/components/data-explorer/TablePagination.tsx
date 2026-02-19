import type { Table as TableType } from "@tanstack/react-table";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function TablePagination<TData extends object>({
  table,
  numOfRows,
  currentRows
}: {
  table: TableType<TData>;
  numOfRows: number;
  currentRows: number;
}) {
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const start = numOfRows === 0 ? 0 : pageIndex * pageSize + 1;
  const end = Math.min(numOfRows, (pageIndex + 1) * pageSize);
  const visibleColumns = table.getAllLeafColumns().filter( (col)=>{
    return col.getIsVisible();
  }); 

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-4 px-4 ">
      <span className="text-base font-regular leading-5 text-[#3E3E3E] flex items-center">
        {visibleColumns.length} columns, {currentRows} rows
      </span>

      <div className="flex items-center gap-x-3">
        <span className="flex text-sm">
          {start} - {end} of {numOfRows}
        </span>

        <button
          type="button"
          className={cn(
            "cursor-pointer",
            !table.getCanPreviousPage() ? "opacity-25" : "opacity-100"
          )}
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          aria-label="Previous page"
        >
          <ChevronLeftIcon size={24}/>
        </button>

        <button
          type="button"
          className={cn(
            "cursor-pointer",
            !table.getCanNextPage() ? "opacity-25" : "opacity-100"
          )}
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          aria-label="Next page"
        >
          <ChevronRightIcon size={24}/>
        </button>
      </div>
    </div>
  );
}



