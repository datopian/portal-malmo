"use client";
import { useTranslations } from "next-intl";

type PaginationSettingsProps = {
  pageSize: number;
  onPageSizeChange: (pageSize: number) => void;
  options?: number[];
};

export default function PaginationSettings({
  pageSize,
  onPageSizeChange,
  options = [10, 20, 30, 40, 50, 100],
}: PaginationSettingsProps) {
  const t = useTranslations();
  return (
    <div className="">
      <div className="">
        <span className=" block font-medium ">
          {t("Common.pagination")}
        </span>
      </div>

      <div className="flex justify-between items-center pt-2">
        <span className="text-sm">{t("Preview.rowsPerPage")}</span>

        <select
          className="p-1 shadow-sm rounded bg-white text-sm"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
        >
          {options.map((v) => (
            <option key={`rows-per-page-${v}`} value={v}>
              {v}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
