"use client";
import React from "react";
import { DataStateProvider, useResourceData } from "./DataProvider";
import SearchDataForm from "./SearchDataForm";
import { SettingsDisplayButton, SettingsDisplayPanel } from "./SettingsDisplay";
import TablePagination from "./Pagination";
import TableData from "./Table";
import { Skeleton } from "../ui/skeleton";
import { useTranslations } from "next-intl";

const CSVExplorer = () => {
  const { isSettingsDropdownOpen, isLoading } = useResourceData() || {};

  return isLoading ? (
    <ResourcePreviewSkeleton />
  ) : (
    <div>
      <div className="flex gap-4">
        <SearchDataForm />
        <SettingsDisplayButton />
      </div>
      <div className="flex w-full gap-[16px] bg-white">
        {isSettingsDropdownOpen && (
          <div className="order-2 py-4 bg-theme border-l border-dashed border-accent-100 ml-auto min-w-[250px] max-w-[250px]">
            <SettingsDisplayPanel />
          </div>
        )}
        <TableData />
      </div>
      <div className="mt-4">
        <TablePagination />
      </div>
    </div>
  );
};

export function ResourcePreviewSkeleton() {
  const columns = Array.from({ length: 5 });
  const rows = Array.from({ length: 5 });
  const t = useTranslations();

  return (
    <div className="mt-2 pt-5 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
      <span className="block mb-4 text-sm">{t("Common.loadingData")}</span>
      <div className="flex w-full gap-4 bg-white">
        <div className="overflow-auto max-h-[750px] relative border-y min-h-[500px] w-full">
          <table className="min-w-full table-auto border-collapse border-0 static">
            <tbody className="divide-y divide-accent-100">
              {rows.map((_, rowIdx) => (
                <tr key={rowIdx}>
                  {columns.map((_, colIdx) => (
                    <td
                      key={colIdx}
                      className="px-3 py-4 text-sm text-gray-500"
                    >
                      <Skeleton className="h-4 w-40" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between bg-white py-3 w-full">
          <div className="hidden sm:block">
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="flex flex-1 justify-between sm:justify-end gap-3">
            <Skeleton className="h-9 w-24 rounded-md" />
            <Skeleton className="h-9 w-24 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
interface CSVExplorerWrapperProps {
  dataUrl: string;
}

const CSVExplorerWrapper: React.FC<CSVExplorerWrapperProps> = ({ dataUrl }) => {
  return (
    <DataStateProvider dataUrl={dataUrl}>
      <CSVExplorer />
    </DataStateProvider>
  );
};

export default CSVExplorerWrapper;
