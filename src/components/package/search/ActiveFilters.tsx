import { useTranslations } from "next-intl";
import FilterBadge from "./FilterBadge";
import { useSearchState } from "./SearchContext";
import { PackageFacetOptions, PackageSearchOptions } from "@/schemas/ckan";

export default function ActiveFilters({
  title,
  hide = [],
}: {
  title?: string;
  hide?: string[];
}) {
  const t = useTranslations();
  const { options, setOptions, result, hasFiltersApplied, defaultOrg } =
    useSearchState();
  const groups = options?.groups ?? [];
  const orgs = options?.orgs ?? [];
  const tags = options?.tags ?? [];
  const resFormat = options?.resFormat ?? [];

  const removeItemFromFilter = (
    filterType: keyof PackageSearchOptions,
    item: string
  ) => {
    if (Array.isArray(options?.[filterType])) {
      const updatedFilters = options[filterType]?.filter(
        (i: string) => i !== item
      );
      setOptions({
        ...options,
        [filterType]: updatedFilters,
      });
    }
  };

  return (
    hasFiltersApplied && (
      <div className="space-y-2">
        <div className="flex gap-3 mb-2">
          {title && (
            <div className="font-medium  md:text-base ">{title}</div>
          )}
          <button
            type="button"
            onClick={() => {
              setOptions({
                resFormat: [],
                groups: [],
                ...(defaultOrg ? null : { orgs: [] }),
                tags: [],
              });
            }}
            className="text-sm underline decoration-foreground hover:text-foreground cursor-pointer font-light  "
          >
            {t("Common.clearAll")}
          </button>
        </div>
        <div className="flex gap-x-4 gap-y-2 flex-wrap text-sm">
          {orgs.length > 0 && !hide.includes("orgs") && (
            <FilterBadge
              badgeClassName="hover:bg-gray-100 transition"
              items={orgs}
              itemTitleRender={(item: string) => {
                return (
                  result?.search_facets?.organization?.items.find(
                    (i: PackageFacetOptions) => i.name === item
                  )?.display_name ?? item
                );
              }}
              onItemClick={(item) => {
                removeItemFromFilter("orgs", item);
              }}
              label={t("Common.organization")}
              description={t("Common.organization")}
            />
          )}

          {groups.length > 0 && (
            <FilterBadge
              label={t("Common.groups")}
              description={t("Common.groups")}
              badgeClassName="hover:bg-gray-100 transition"
              items={groups}
              itemTitleRender={(item: string) => {
                return (
                  result?.search_facets?.groups?.items.find(
                    (i: PackageFacetOptions) => i.name === item
                  )?.display_name ?? item
                );
              }}
              onItemClick={(item) => {
                removeItemFromFilter("groups", item);
              }}
            />
          )}

          {resFormat.length > 0 && (
            <FilterBadge
              label={t("Common.formats")}
              description={t("Common.formats")}
              items={resFormat}
              badgeClassName="hover:bg-gray-100 transition"
              itemTitleRender={(item: string) => {
                return (
                  result?.search_facets?.resFormat?.items.find(
                    (i: PackageFacetOptions) => i.name === item
                  )?.display_name ?? item
                );
              }}
              onItemClick={(item) => {
                removeItemFromFilter("resFormat", item);
              }}
            />
          )}

          {tags.length > 0 && (
            <FilterBadge
              label={t("Common.tags")}
              description={t("Common.tags")}
              items={tags}
              badgeClassName="hover:bg-gray-100 transition"
              itemTitleRender={(item: string) => {
                return (
                  result?.search_facets?.tags?.items.find(
                    (i: PackageFacetOptions) => i.name === item
                  )?.display_name ?? item
                );
              }}
              onItemClick={(item) => {
                removeItemFromFilter("tags", item);
              }}
            />
          )}
        </div>
      </div>
    )
  );
}
