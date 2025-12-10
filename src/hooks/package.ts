import { searchDatasets } from "@/lib/ckan/dataset";
import { PackageSearchOptions } from "@/schemas/ckan";
import { useQuery } from "@tanstack/react-query";

export function usePackageSearch(
  options: PackageSearchOptions,
  owner_org?: string
) {
  return useQuery({
    queryKey: ["package_search", options],
    queryFn: () =>
      searchDatasets({
        options,
        owner_org,
      }),
    placeholderData: (previousData) => previousData,
  });
}
