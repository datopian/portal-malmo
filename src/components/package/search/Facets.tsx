import { useTranslations } from "next-intl";
import { useSearchState } from "./SearchContext";
import FacetCard from "@/components/package/search/FacetCard";
import { SlidersHorizontal } from "lucide-react";

export default function Facets({ title=false }: { title?: string | boolean }) {
  const { result, options, setOptions } = useSearchState();
  const searchResultFacets = result?.search_facets || {};
  const t = useTranslations();
  const selectedGroups = options?.groups ?? [];
  const selectedFormats = options?.resFormat ?? [];
  const selectedTags = options?.tags ?? [];
  const groupItems = searchResultFacets?.groups?.items ?? [];
  const formatItems = searchResultFacets?.res_format?.items ?? [];
  const tagItems = searchResultFacets?.tags?.items ?? [];

  const ensureSelectedItems = (items: typeof groupItems, selected: string[]) => {
    const existing = new Set(items.map((item) => item.name));
    const missing = selected
      .filter((name) => !existing.has(name))
      .map((name) => ({ name, display_name: name, count: 0 }));
    return [...items, ...missing];
  };
  return (
    <div className="search-facets">
      {title && (
        <h2 className="mb-3 flex items-center gap-2 text-xl font-bold text-theme-green">
          <SlidersHorizontal aria-hidden="true" size={20} />
          {t("Search.filters")}
        </h2>
      )}
      {(groupItems.length > 0 || selectedGroups.length > 0) && (
        <FacetCard
          name="groups"
          title={`${t("Common.groups")}`}
          items={ensureSelectedItems(groupItems, selectedGroups)}
          options={options?.groups}
          onSelect={(updatedValues) => {
            setOptions({ groups: updatedValues, offset: 0 });
          }}
        />
      )}
      {(formatItems.length > 0 || selectedFormats.length > 0) && (
        <FacetCard
          name="resFormat"
          title={`${t("Common.formats")}`}
          items={ensureSelectedItems(formatItems, selectedFormats)}
          options={options?.resFormat}
          onSelect={(updatedValues) => {
            setOptions({ resFormat: updatedValues, offset: 0 });
          }}
        />
      )}
      {(tagItems.length > 0 || selectedTags.length > 0) && (
        <FacetCard
          name="tags"
          title={`${t("Common.tags")}`}
          items={ensureSelectedItems(tagItems, selectedTags)}
          options={options?.tags}
          onSelect={(updatedValues) => {
            setOptions({ tags: updatedValues, offset: 0 });
          }}
        />
      )}
    </div>
  );
}
