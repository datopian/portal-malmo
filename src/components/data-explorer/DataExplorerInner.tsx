"use client";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
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
import { Download, Settings, X } from "lucide-react";
import { Transition } from "@headlessui/react";
import { ColumnsSettings } from "./ColumnsSettings";
import { FiltersSettings } from "./FiltersSettings";
import { useWindow, useWindowSize } from "./ui.utils";
import { TablePagination } from "./TablePagination";
import { TableActiveFilters } from "./TableActiveFilters";
import PaginationSettings from "./PaginationSettings";
import Link from "next/link";
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
  const window = useWindow();
  const { width: windowWidth, height: windowHeight } = useWindowSize();
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

  const containerWidth = containerRef.current?.clientWidth ?? 0;

  const [containerSpacing, setContainerSpacing] =
    useState<number>(containerWidth);

  useEffect(() => {
    if (window && containerRef?.current) {
      const marginRight = parseFloat(
        getComputedStyle(containerRef.current!).marginRight,
      );
      if (marginRight <= 316) {
        setContainerSpacing(316 - marginRight + 32);
      }
    }
  }, [window, windowWidth, windowHeight, containerWidth]);

  return (
    <div className="relative flex w-full overflow-hidden ">
      <div
        ref={containerRef}
        className={cn(
          "container max-w-6xl mx-auto px-4",
          "w-full pt-4 transition-[padding] duration-200",
          isSettingsDropdownOpen ? "min-h-[850px]" : "",
        )}
        style={
          isSettingsDropdownOpen && windowWidth >= 1204
            ? {
                paddingRight: containerSpacing,
              }
            : {}
        }
      >
        <div>
          <div className="flex justify-end gap-2 md:gap-4 w-full mb-4">
            <Button variant={"outline"} asChild>
              <Link href={resource.url ?? ""} target="_blank">
                <Download />
                <span className="hidden md:inline">Download</span>
              </Link>
            </Button>
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
          className="shrink-0 w-[316px] rounded-bl-lg min-h-fit h-full overflow-hidden absolute right-0 bg-white  p-5 shadow-lg lg:border-l lg:shadow-none z-20 border-b "
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
