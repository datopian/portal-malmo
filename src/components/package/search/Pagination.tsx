"use client";
import { useTranslations } from "next-intl";
import { useSearchState } from "./SearchContext";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ count }: { count: number }) {
  const t = useTranslations();
  const { options, setOptions } = useSearchState();
  const max = options?.limit ?? 0;

  if (!max || count === 0) return null;

  const totalPages = Math.ceil(count / max);
  const currentPage = Math.max(
    1,
    Math.min(Math.floor((options?.offset ?? 0) / max) + 1, totalPages)
  );
  const pageLimit = 3;

  const goToPage = (page: number) => {
    setOptions({ ...options, offset: (page - 1) * max });
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const generatePageNumbers = () => {
    const pages: (number | "...")[] = [];

    if (totalPages <= pageLimit + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);

      if (currentPage > 3) pages.push("...");

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) pages.push(i);

      if (currentPage < totalPages - 2) pages.push("...");

      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex  items-center w-full text-xl justify-center py-4 gap-2 md:gap-3">
      {currentPage > 1 && (
        <button
          className="flex items-center gap-2 cursor-pointer  text-gray-600 hover:text-foreground"
          onClick={() => goToPage(currentPage - 1)}
        >
          <ChevronLeft width={16} />
          <span className="text-sm md:text-base hidden md:block">{t("Common.previous")}</span>
        </button>
      )}

      {generatePageNumbers().map((page, index) =>
        page === "..." ? (
          <span key={index} className="font-light">
            ...
          </span>
        ) : (
          <button
            key={index}
            className={`py-1 px-3 text-lg rounded-lg  cursor-pointer text-sm md:text-base ${
              page === currentPage
                ? "text-foreground border"
                : "text-gray-600 font-light hover:text-foreground"
            }`}
            onClick={() => goToPage(page)}
          >
            {page}
          </button>
        )
      )}

      {currentPage < totalPages && (
        <button
          className="flex items-center  gap-2 cursor-pointer text-gray-600 hover:text-foreground"
          onClick={() => goToPage(currentPage + 1)}
        >
          <span className="hidden md:block text-sm md:text-base">{t("Common.next")}</span>
          <ChevronRight width={16} />
        </button>
      )}
    </div>
  );
}
