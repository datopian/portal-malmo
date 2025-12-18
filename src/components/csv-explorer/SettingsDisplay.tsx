import { useEffect, useMemo, useState } from "react";
import { useResourceDataSafe } from "./DataProvider";
import { PinButton } from "./TableHeadCell";
import { CheckIcon, Settings2, XIcon } from "lucide-react";
import { Button } from "../ui/button";
import { useTranslations } from "next-intl";

export function SettingsDisplayButton() {
  const { toggleSettingsDropdown, isSettingsDropdownOpen } =
    useResourceDataSafe();
  const t = useTranslations();
  return (
    <div className="relative inline-block mb-4">
      <Button
        onClick={toggleSettingsDropdown}
        aria-haspopup="true"
        aria-expanded={isSettingsDropdownOpen}
        variant="secondary"
        className="cursor-pointer border "
      >
        <Settings2 size={5}/>
        <span className="hidden sm:block">{t("Common.settings")}</span>
      </Button>
    </div>
  );
}

export function SettingsDisplayPanel() {
  const t = useTranslations();

  const {
    columns,
    isSettingsDropdownOpen,
    data,
    visibleColumns,
    toggleColumnVisibility,
    pinnedColumns,
    rowsPerPage,
    setRowsPerPage,
    setVisibleColumns,
  } = useResourceDataSafe();

  const cols = useMemo(
    () =>
      Array.isArray(data) && data.length > 0 ? Object.keys(data[0] ?? {}) : [],
    [data]
  );

  const [checkAll, setCheckAll] = useState(
    visibleColumns.length === columns.length
  );
  const [columnSearchValue, setColumnSearchValue] = useState("");

  useEffect(() => {
    setCheckAll(visibleColumns.length === columns.length);
  }, [visibleColumns, columns.length]);

  const filteredCols = useMemo(
    () =>
      cols.filter((item) =>
        item?.toLowerCase().includes(columnSearchValue.toLowerCase())
      ),
    [cols, columnSearchValue]
  );

  const handleCheckAll = () => {
    const next = !checkAll;
    setCheckAll(next);
    setVisibleColumns(next ? columns : []);
  };

  if (!isSettingsDropdownOpen) return null;

  return (
    <div
      className="text-gray-700 text-sm flex flex-col gap-8"
      aria-label="Column visibility options"
    >
      <div>
        <div className="px-4 mb-4">
          <span className="text-gray-600 uppercase text-xs mb-2 block font-bold">
            {t("Preview.columns")} ({columns.length})
          </span>

          <div className="mt-2 grid grid-cols-1">
            <input
              className="col-start-1 row-start-1 block w-full rounded-md bg-white py-1.5 pl-3 pr-10 sm:pr-9"
              placeholder={t("Preview.searchColumnsPlaceholder")}
              aria-label={t("Preview.searchColumnsPlaceholder")}
              value={columnSearchValue}
              onChange={(e) => setColumnSearchValue(e.target.value)}
            />
            {columnSearchValue.length > 0 && (
              <button
                type="button"
                className="col-start-1 row-start-1 mr-1 self-center justify-self-end"
                aria-label="Clear column search input"
                onClick={() => setColumnSearchValue("")}
              >
                <XIcon />
              </button>
            )}
          </div>
        </div>

        {filteredCols.length > 0 && (
          <div className="flex items-center mb-[10px] px-4">
            <input
              id="resource-preview-column-checkall"
              type="checkbox"
              checked={checkAll}
              onChange={handleCheckAll}
              className="hidden"
            />
            <label
              htmlFor="resource-preview-column-checkall"
              tabIndex={0}
              className={`h-5 w-5 min-w-[1.25rem] flex items-center justify-center rounded border-2 cursor-pointer ${
                checkAll
                  ? "bg-accent border-accent text-white"
                  : "bg-white border-gray-200"
              } transition-colors`}
              onKeyDown={(e) => {
                if (e.key === " " || e.key === "Enter") {
                  e.preventDefault();
                  handleCheckAll();
                }
              }}
            >
              {checkAll && <CheckIcon width={16} />}
              <span className="sr-only">{t("Preview.checkAllColumns")}</span>
            </label>
            <span
              onClick={handleCheckAll}
              className="ml-3 text-gray-900 cursor-pointer flex gap-1 w-full"
            >
              {t("Common.checkAll")}
            </span>
          </div>
        )}

        <div className="max-h-[320px] overflow-y-auto">
          {filteredCols.length === 0 && (
            <div className="italic text-sm px-4">{t("Preview.noColumns")}</div>
          )}

          {filteredCols.map((column, index) => {
            const active = visibleColumns.includes(column);
            const pinned = pinnedColumns.includes(column);

            return (
              <div
                key={column}
                className={`flex items-center group px-4 py-2 hover:bg-accent-100 ${
                  pinned ? "bg-accent-100 font-medium" : ""
                }`}
              >
                <div className="flex gap-2 justify-between w-full">
                  <input
                    id={`resource-preview-column-${column}-${index}`}
                    type="checkbox"
                    checked={active}
                    onChange={() => toggleColumnVisibility(column)}
                    className="hidden"
                  />
                  <label
                    htmlFor={`resource-preview-column-${column}-${index}`}
                    tabIndex={0}
                    className={`h-5 w-5 min-w-[1.25rem] flex items-center justify-center rounded border-2 cursor-pointer ${
                      active
                        ? "bg-accent border-accent text-white"
                        : "bg-white border-gray-200"
                    } transition-colors`}
                    onKeyDown={(e) => {
                      if (e.key === " " || e.key === "Enter") {
                        e.preventDefault();
                        toggleColumnVisibility(column);
                      }
                    }}
                  >
                    {active && <CheckIcon width={16} />}
                    <span className="sr-only">{column}</span>
                  </label>
                  <span
                    onClick={() => toggleColumnVisibility(column)}
                    className="ml-3 text-[#5F5F5F] cursor-pointer flex gap-1 w-full break-all"
                  >
                    {column}
                  </span>
                </div>
                <PinButton col={column} />
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <div className="px-4">
          <span className="text-gray-600 uppercase text-xs mb-2 block font-bold">
            {t("Common.pagination")}
          </span>
        </div>
        <div className="flex justify-between px-4">
          <span>{t("Preview.rowsPerPage")}</span>
          <select
            className="p-1 shadow-sm rounded bg-white"
            value={rowsPerPage}
            onChange={(e) => setRowsPerPage(Number(e.target.value))}
          >
            {[10, 20, 30, 40, 50, 100].map((v) => (
              <option key={`rows-per-page-${v}`} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
