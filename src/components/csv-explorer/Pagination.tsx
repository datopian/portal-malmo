import { useTranslations } from "next-intl";
import { useResourceData } from "./DataProvider";

export default function TablePagination() {
  const context = useResourceData();
  const t = useTranslations();

  if (!context) {
    return null;
  }

  const { currentPage, totalPages, setCurrentPage } = context;

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-between bg-white py-3 w-full"
      role="navigation"
    >
      <div className="hidden sm:block">
        <p className="text-sm text-gray-700">
          {t("Preview.pagination", {page:currentPage, total:totalPages})} 
        </p>
      </div>
      <div className="flex flex-1 justify-between sm:justify-end">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          className="cursor-pointer relative inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0"
          aria-label="Previous page"
        >
          {t("Common.previous")}
        </button>
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          className="cursor-pointer relative ml-3 inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0"
          aria-label="Next page"
        >
          {t("Common.next")}
        </button>
      </div>
    </nav>
  );
}
