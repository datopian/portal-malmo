"use client";

import { useSearchState } from "./SearchContext";
import { useTranslations } from "next-intl";

export default function SearchResultHeader() {
  const { options, result, isLoading } = useSearchState();
  const t = useTranslations("Search");

  const count = result?.count ?? 0;
  const hasQuery = !!options?.query && options.query.trim().length > 0;

  const title = hasQuery
    ? t("headerWithQuery", { query: options!.query??"" })
    : count > 0
    ? t("headerCount", { count })
    : !isLoading
    ? t("headerNoResults")
    : "";

  return (
    <div className="flex flex-col">
      <h1 className="text-xl lg:text-2xl font-bold relative">
        {title}
      </h1>

      {!isLoading && hasQuery && count > 0 && (
        <p className="min-h-6">
          {t("headerShowing", { count })}
        </p>
      )}
    </div>
  );
}
