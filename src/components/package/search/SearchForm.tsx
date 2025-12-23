"use client";

import { FormEventHandler, MouseEventHandler, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { envVars } from "@/lib/env";

const SUPPORTED_LOCALES = envVars.i18nSupportedLocales;

export default function SearchForm({
  title,
  value = "",
  placeholder = "",
  onSubmit,
}: {
  title?: string;
  value?: string;
  placeholder?: string;
  onSubmit?: (q: string) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQuery] = useState(() => searchParams.get("query") ?? value);
  const t = useTranslations();

  const getLocaleFromPathname = () => {
    const segments = pathname.split("?")[0].split("/").filter(Boolean);
    const first = segments[0];
    if (SUPPORTED_LOCALES.length > 1 && SUPPORTED_LOCALES.includes(first)) {
      return first;
    }
    return undefined;
  };

  const localeInPath = getLocaleFromPathname();

  const isSearchPage = pathname.split("?")[0].endsWith("/data");

  const buildSearchUrl = () => {
    const baseSearchPath = isSearchPage
      ? pathname.split("?")[0]
      : localeInPath
      ? `/${localeInPath}/data`
      : `/data`;

    const params = new URLSearchParams();
    if (q) params.set("query", q);

    const qs = params.toString();
    return qs ? `${baseSearchPath}?${qs}` : baseSearchPath;
  };

  const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();

    if (onSubmit) {
      onSubmit(q ?? "");
    } else {
      const url = buildSearchUrl();
      console.log(url);
      router.push(url);
    }
    return false;
  };

  const handleClearQuery: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    setQuery("");
    ref.current?.focus();
    const params = new URLSearchParams(window.location.search);
    params.delete("query");
    const newSearch = params.toString();
    const newPath = newSearch ? `${pathname}?${newSearch}` : `${pathname}`;
    router.push(newPath);
    return false;
  };

  useEffect(() => {
    setQuery(searchParams.get("query") ?? "");
  }, [searchParams]);

  return (
    <div className="p-5 md:p-8 bg-theme-green text-white max-w-[768px] shadow-xl">
      {title && (
        <h3 className="text-xl md:text-2xl lg:text-4xl mb-4 font-semibold">
          {title}
        </h3>
      )}
      <form className="text-foreground" onSubmit={handleSubmit}>
        <div className="flex w-full relative gap-2">
          <input
            ref={ref}
            aria-label={placeholder}
            type="text"
            name="query"
            placeholder={placeholder}
            onChange={(e) => setQuery(e.target.value)}
            value={q}
            className="w-full px-4 py-3 bg-white pr-[60px] focus:shadow-lg  outline-0 border border-gray-200"
          />
          {q && (
            <button
              type="button"
              aria-label="Clear search"
              className="cursor-pointer absolute right-[140px] top-[14px] text-gray-600 hover:text-gray-900 transition"
              onClick={handleClearQuery}
            >
              <X className="size-5" />
            </button>
          )}
          <button
            type="submit"
            aria-labelledby="search-label"
            className="flex min-w-[120px] justify-center cursor-pointer hover:bg-theme-green-light/90 bg-theme-green-light items-center px-4 md:px-8 text-white font-bold transition h-[50px]"
          >
            {t("Common.search")}
            <span className="sr-only" id="search-label">
              {t("Common.search")}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
