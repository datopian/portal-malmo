"use client";

import { usePackageSearch } from "@/hooks/package";
import { PackageSearchOptions, PackageSearchResponse } from "@/schemas/ckan";
import { useRouter, useSearchParams } from "next/navigation";
import {
  createContext,
  JSX,
  useContext,
  useMemo,
  useCallback,
} from "react";

type setQueryParamFn<T> = (value: T) => void;

interface SearchStateContext {
  defaultOrg?: string | null;
  result: Partial<PackageSearchResponse> | null;
  options: PackageSearchOptions;
  isLoading: boolean;
  isFetching: boolean;
  hasFiltersApplied: boolean;
  setOptions: setQueryParamFn<Partial<PackageSearchOptions>>;
  error: Error | null;
}

export const SearchStateContext = createContext<SearchStateContext>({
  defaultOrg: null,
  result: null,
  options: {
    offset: 0,
    limit: 10,
    tags: [],
    groups: [],
    orgs: [],
    resFormat: [],
    query: "",
    sort: "score desc",
    include_private: false,
  },
  isLoading: true,
  isFetching: true,
  hasFiltersApplied: false,
  error: null,
  setOptions: () => null,
});

const ignoredParams: { [key: string]: boolean } = {
  limit: true,
  include_private: true,
};

export const useSearchState = () => useContext(SearchStateContext);

export const SearchStateProvider = ({
  defaultOrg,
  children,
}: {
  defaultOrg?: string | null;
  children: React.ReactNode | JSX.Element;
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const options: PackageSearchOptions = useMemo(() => {
    const getParam = (key: string) => searchParams.get(key);
    const getParamArray = (key: string) => searchParams.getAll(key);

    const offsetRaw = parseInt(getParam("offset") ?? "0", 10);
    const offset = Number.isFinite(offsetRaw) ? offsetRaw : 0;

    return {
      offset,
      limit: 10,
      tags: getParamArray("tags"),
      groups: getParamArray("groups"),
      orgs: defaultOrg ? [defaultOrg] : getParamArray("orgs"),
      resFormat: getParamArray("resFormat"),
      query: getParam("query") ?? "",
      sort: getParam("sort") ?? "metadata_modified desc",
      include_private: false,
    };
  }, [searchParams, defaultOrg]);

  const setOptions = useCallback(
    (partial: Partial<PackageSearchOptions>) => {
      const url = new URL(window.location.href);
      const params = url.searchParams;

      Object.entries(partial).forEach(([key, value]) => {
        if (ignoredParams[key]) return;

        params.delete(key);

        if (Array.isArray(value)) {
          value.forEach((v) => params.append(key, v));
          return;
        }

        if (value !== undefined && value !== null && value !== "") {
          params.set(key, String(value));
        }
      });

      router.replace(`${url.pathname}?${params.toString()}`);
    },
    [router]
  );

  const hasFiltersApplied = useMemo(() => {
    return (
      (options.resFormat ?? []).length > 0 ||
      (options.groups ?? []).length > 0 ||
      (!defaultOrg && (options.orgs ?? []).length > 0) ||
      (options.tags ?? []).length > 0
    );
  }, [options, defaultOrg]);

  const { data, error, isLoading, isFetching } = usePackageSearch(
    options,
    defaultOrg ?? undefined
  );

  return (
    <SearchStateContext.Provider
      value={{
        defaultOrg,
        options,
        result: data ?? null,
        error,
        isLoading,
        isFetching,
        hasFiltersApplied,
        setOptions,
      }}
    >
      {children}
    </SearchStateContext.Provider>
  );
};