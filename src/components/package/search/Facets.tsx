import { useTranslations } from "next-intl";
import { useSearchState } from "./SearchContext";
import FacetCard from "@/components/package/search/FacetCard";
import { SlidersHorizontal } from "lucide-react";

export default function Facets({ title=false }: { title?: string | boolean }) {
  const { result, options, defaultOrg, setOptions } = useSearchState();
  const searchResultFacets = result?.search_facets || {};
  const t = useTranslations();
  return (
    <div className="search-facets">
      {title && (
        <span className="flex items-center gap-2 mb-3 text-theme-green text-xl font-bold">
          <SlidersHorizontal size={20} />
          {t("Search.filters")}
        </span>
      )}
      {searchResultFacets?.groups?.items?.length > 0 && (
        <FacetCard
          name="groups"
          title={`${t("Common.groups")}`}
          items={searchResultFacets?.groups?.items}
          options={options?.groups}
          onSelect={(updatedValues) => {
            setOptions({ groups: updatedValues, offset: 0 });
          }}
        />
      )}
      {searchResultFacets?.res_format?.items?.length > 0 && (
        <FacetCard
          name="resFormat"
          title={`${t("Common.formats")}`}
          items={searchResultFacets?.res_format?.items}
          options={options?.resFormat}
          onSelect={(updatedValues) => {
            setOptions({ resFormat: updatedValues, offset: 0 });
          }}
        />
      )}
      {searchResultFacets?.tags?.items?.length > 0 && (
        <FacetCard
          name="tags"
          title={`${t("Common.tags")}`}
          items={searchResultFacets?.tags?.items}
          options={options?.tags}
          onSelect={(updatedValues) => {
            setOptions({ tags: updatedValues, offset: 0 });
          }}
        />
      )}
    </div>
  );
}
