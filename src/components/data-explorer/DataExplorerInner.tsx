"use client";
import { Fragment, useMemo, useRef, useState } from "react";
import { Table } from "./Table";
import {
  ColumnFiltersState,
  ColumnSort,
  getCoreRowModel,
  PaginationState,
  Updater,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { useNumberOfRows, useTableData } from "./queryHooks";
import { FilterObjType } from "./search.schema";

import { Button } from "../ui/button";
import { Settings, X } from "lucide-react";
import { Transition } from "@headlessui/react";
import { ColumnsSettings } from "./ColumnsSettings";
import { FiltersSettings } from "./FiltersSettings";
import { useWindowSize } from "./ui.utils";
import { TablePagination } from "./TablePagination";
import { TableActiveFilters } from "./TableActiveFilters";
import PaginationSettings from "./PaginationSettings";
import { Resource } from "@/schemas/ckan";
import { cn } from "@/lib/utils";

export interface DataExplorerInnerProps {
  resource: Resource;
  columns: { key: string; name: string; type: string; default?: string }[];
}

export interface DataExplorerColumnFilter {
  id: string;
  value: FilterObjType[];
}

export default function DataExplorerInner({
  resource,
  columns,
}: DataExplorerInnerProps) {
  const resourceId = resource.id;
  const cols = useMemo(() => columns ?? [], [columns]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [isSettingsDropdownOpen, setIsSettingsDropdownOpen] =
    useState<boolean>(false);

  const [sorting, setSorting] = useState<ColumnSort[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const { width: windowWidth,  } = useWindowSize();
  const [columnPinning, setColumnPinning] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<
    DataExplorerColumnFilter[]
  >([]);

  const filteredColumns = columnFilters
    .map((filter) => ({
      ...filter,
      value: filter.value.filter((v) => v.value !== ""),
    }))
    .filter((filter) => filter.value.length > 0);

  const { data: numOfRows } = useNumberOfRows({
    resourceId,
    filters: filteredColumns,
  });

  const pageCount = numOfRows ? Math.ceil(numOfRows / pagination.pageSize) : 0;

  const startRow = pagination.pageIndex * pagination.pageSize + 1;

  const endRow = Math.min(
    (pagination.pageIndex + 1) * pagination.pageSize,
    numOfRows ?? 0,
  );

  const rowsOnCurrentPage = endRow - startRow + 1;

  const {
    data: tableData,
    isLoading,
    isPlaceholderData,
    isFetching,
  } = useTableData({
    resourceId,
    pagination,
    sorting,
    columns: columns.map((c) => c.key),
    filters: filteredColumns,
  });

  useTableData({
    resourceId,
    pagination: {
      pageIndex: pagination.pageIndex + 1,
      pageSize: pagination.pageSize,
    },
    sorting,
    filters: filteredColumns,
    columns: columns.map((c) => c.key),
    enabled: !isLoading,
  });

  const data = useMemo(() => tableData ?? [], [tableData]);
  const tableCols = useMemo(() => {
    return cols.map((c) => ({
      accessorKey: c.key,
      header: c.name,
      meta: {
        type: c.type,
        default: c.default,
      },
    }));
  }, [cols]);

  const table = useReactTable({
    data,
    columns: tableCols,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    onPaginationChange: setPagination,
    manualSorting: true,
    onSortingChange: setSorting,
    manualFiltering: true,
    onColumnFiltersChange: setColumnFilters as (
      filters: Updater<ColumnFiltersState>,
    ) => void,
    pageCount,
    onColumnPinningChange: setColumnPinning,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      pagination,
      sorting,
      columnPinning,
      columnVisibility,
      columnFilters: filteredColumns,
    },
  });

  const resetPagination = () => {
    setPagination({
      pageIndex: 0,
      pageSize: 10,
    });
  };

  if (pageCount < pagination.pageIndex) resetPagination();

  return (
    <div className="relative flex w-full gap-4 ">
      <div
        ref={containerRef}
        className={cn(
          "w-full",
          isSettingsDropdownOpen && windowWidth >= 1200
            ? "w-[calc(100%-320px)] pt-4 transition-padding duration-200"
            : `w-full`,
        )}
       
      >
        <div>
          <div className="flex justify-end gap-2 md:gap-4 w-full mb-4">
            <Button
              variant={isSettingsDropdownOpen ? "secondary" : "outline"}
              className="cursor-pointer"
              data-cy="data-explorer-filters-settings"
              onClick={() => setIsSettingsDropdownOpen(!isSettingsDropdownOpen)}
            >
              <Settings />
              <span className="hidden md:inline">Filters &amp; Settings</span>
            </Button>
          </div>
          <div>
            <div className="flex flex-col">
              <div className="flex flex-row justify-between grow">
                <TableActiveFilters
                  filters={filteredColumns}
                  setFilters={setColumnFilters}
                  columns={cols}
                />
              </div>
            </div>

            <div className="flex flex-col grow relative">
              {isFetching && isPlaceholderData && (
                <span className="w-full h-1.5 animate-pulse-fast bg-accent/60 absolute top-0 left-0 z-10" />
              )}
              <Table
                table={table}
                numOfRows={numOfRows ?? 0}
                isLoading={isLoading}
                columnFilters={columnFilters}
              />

              <TablePagination
                table={table}
                numOfRows={numOfRows ?? 0}
                currentRows={rowsOnCurrentPage}
              />
            </div>
          </div>
        </div>
      </div>

      <Transition
        show={isSettingsDropdownOpen}
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-x-2"
        enterTo="opacity-100 translate-x-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-x-0"
        leaveTo="opacity-0 translate-x-2"
      >
        <aside
          className="shrink-0 w-[320px] absolute -right-4 xl:relative xl:right-auto rounded-bl-lg min-h-fit h-full overflow-hidden bg-white py-4 px-5 shadow-lg  xl:shadow-none z-20 "
          data-cy="data-explorer-settings-panel"
        >
          <div className="flex items-center gap-4 mb-[14px]">
            <h2 className="text-xl font-medium ">Settings</h2>
            <button
              onClick={() => setIsSettingsDropdownOpen(false)}
              className="ml-auto text-foreground-light hover:text-foreground transition-colors cursor-pointer"
            >
              <X size={24} className="" />
              <span className="sr-only">Close settings</span>
            </button>
          </div>
          <div className="space-y-4">
            <FiltersSettings
              table={table}
              filters={
                table.getState().columnFilters as DataExplorerColumnFilter[]
              }
              setFilters={setColumnFilters}
            />
            <ColumnsSettings table={table} />

            <PaginationSettings
              pageSize={pagination.pageSize}
              onPageSizeChange={(nextSize) =>
                setPagination((p) => ({
                  ...p,
                  pageIndex: 0,
                  pageSize: nextSize,
                }))
              }
            />
          </div>
        </aside>
      </Transition>
    </div>
  );
}
