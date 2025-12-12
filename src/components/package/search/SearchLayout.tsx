"use client";

import { useSearchState } from "./SearchContext";

import SearchResultHeader from "./SearchResultHeader";
import SearchResultItem from "./SearchResultItem";
import Pagination from "./Pagination";
import SearchForm from "./SearchForm";
import { Funnel, SlidersHorizontal, X } from "lucide-react";
import ActiveFilters from "./ActiveFilters";
import SortBy from "./SortBy";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { useState } from "react";
import { SearchSkeletonLayout } from "@/components/layout/PageLoading";
import Facets from "./Facets";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export default function SearchLayout({
  showSearchForm = true,
}: {
  showSearchForm?: boolean;
}) {
  const t = useTranslations();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const { result, isLoading, options, defaultOrg, setOptions } =
    useSearchState();
  const hasResults = (result?.count ?? 0) > 0;
  const isPaginated = result?.count ?? 0 > (options?.limit ?? 10);
  return (
    <div className="relative">
      <div className="search-form-and-filters">
        <div className="flex items-center gap-2">
          {showSearchForm && (
            <SearchForm
              value={options?.query}
              onSubmit={(q) => {
                setOptions({
                  query: q,
                });
              }}
            />
          )}
        </div>
      </div>
      <section aria-labelledby="search-heading" className="pb-24">
        <h3 id="search-heading" className="sr-only">
          {t("Search.title")}
        </h3>

        {isLoading ? (
          <SearchSkeletonLayout />
        ) : (
          <div className=" mt-6 grid grid-cols-1 gap-x-20 gap-y-10 lg:grid-cols-4 relative">
            {/* Filters */}
            {hasResults && (
              <form className="hidden lg:block h-fit sticky top-5">
                <Facets title={t("Search.filters")} />
              </form>
            )}

            <div
              className={`${hasResults ? "lg:col-span-3" : "lg:col-span-12"}`}
            >
              <div className="mt-4 flex flex-col gap-4 md:flex-row ">
                <SearchResultHeader />
                {hasResults && (
                  <div className="md:ml-auto w-fit">
                    <SortBy />
                  </div>
                )}
              </div>
              <div className="my-6 flex flex-col md:flex-row md:items-end">
                <div className="">
                  <Button
                    onClick={() => {
                      setMobileFiltersOpen(true);
                    }}
                    variant={"outline"}
                    size={"sm"}
                    className="cursor-pointer lg:hidden mb-4"
                  >
                    <span className="sr-only">{t("Search.filters")}</span>
                    <Funnel aria-hidden="true" className="size-5" />
                    {t("Search.filters")}
                  </Button>
                  <ActiveFilters
                    title="Active Filters"
                    hide={defaultOrg ? ["orgs"] : []}
                  />
                </div>
              </div>
              <div className="flex flex-col space-y-4 mt-4 w-full border border-b-0">
                {result?.datasets?.map((d) => (
                  <SearchResultItem
                    key={d.id}
                    dataset={d}
                    query={options.query}
                  />
                ))}
              </div>
              <div className="">
                {isPaginated ? (
                  <div className="mt-10">
                    <Pagination count={result?.count ?? 0} />
                  </div>
                ) : (
                  <></>
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Mobile filter dialog */}
      <Dialog
        open={mobileFiltersOpen}
        onClose={setMobileFiltersOpen}
        className="relative z-40 lg:hidden"
      >
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-black/25 transition-opacity duration-300 ease-linear data-closed:opacity-0"
        />

        <div className="fixed inset-0 z-40 flex">
          <DialogPanel
            transition
            className="relative ml-auto flex size-full max-w-xs transform flex-col overflow-y-auto bg-white py-4 pb-12 shadow-xl transition duration-300 ease-in-out data-closed:translate-x-full"
          >
            <div className="flex items-center justify-between px-4">
              <span className="flex items-center gap-2 text-theme-green text-xl font-bold">
                <SlidersHorizontal size={20} />
                {t("Search.filters")}
              </span>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="-mr-2 flex size-10 items-center justify-center rounded-md bg-white p-2 text-gray-400"
              >
                <span className="sr-only">{t("Common.close")}</span>
                <X aria-hidden="true" className="size-6" />
              </button>
            </div>
            <form className="mt-4 border-t border-gray-200">
              <Facets />
            </form>
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  );
}
