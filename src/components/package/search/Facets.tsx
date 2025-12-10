import { useTranslations } from "next-intl";
import { useSearchState } from "./SearchContext";
import FacetCard from "@/components/package/search/FacetCard";

export default function Facets() {
  const { result, options, defaultOrg,  setOptions } = useSearchState();
  const searchResultFacets = result?.search_facets || {};
  const t = useTranslations();
  return (
    <div className="search-facets">
      {searchResultFacets?.organization?.items?.length > 0 && !defaultOrg && (
        <FacetCard
          name="orgs"
          title={`🏛️ ${t("Common.organization")}`}
          items={searchResultFacets?.organization?.items}
          options={options?.orgs}   
          onSelect={(updatedValues) => {
            setOptions({ orgs: updatedValues, offset: 0 });
          }}
        />
      )}
      {searchResultFacets?.groups?.items?.length > 0 && (
        <FacetCard
          name="groups"
          title={`📁 ${t("Common.groups")}`}
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
          title={`📦 ${t("Common.formats")}`}
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
          title={`🔖 ${t("Common.tags")}`}
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
