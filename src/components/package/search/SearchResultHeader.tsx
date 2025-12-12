"use client";

import { useSearchState } from "./SearchContext";
import { useTranslations } from "next-intl";

export default function SearchResultHeader() {
  const { options, result, isLoading } = useSearchState();
  const t = useTranslations("Search");

  const count = result?.count ?? 0;
  const hasQuery = !!options?.query && options.query.trim().length > 0;

  return (
    <div className="flex flex-col">
      <h1 className="text-xl lg:text-2xl font-bold relative text-theme-green">
        {t("datasetsFound", { count })}
      </h1>

      {!isLoading && hasQuery && (
        <p className="min-h-6">
          {t("headerWithQuery", { query: options?.query ?? "" })}
        </p>
      )}
    </div>
  );
}
