import {
  Dataset,
  PackageSearchOptions,
  PackageSearchResponse,
} from "@/schemas/ckan";
import { CkanResponse } from "@portaljs/ckan-api-client-js";
import { fetchJsonRetry, fetchRetry, joinTermsWithOr } from "../utils";
import { ISR_REVALIDATE_SECONDS } from "../isr";

const DMS = process.env.NEXT_PUBLIC_DMS;

export interface SearchDatasetsParams {
  options: PackageSearchOptions;
  owner_org?: string | null;
  facetFields?: string[];
}

export async function searchDatasets({
  options,
  owner_org = null,
  facetFields = ["groups", "organization", "res_format", "tags"],
}: SearchDatasetsParams) {
  const baseAction = `package_search`;

  const _facetFields = (facetFields ?? []).map((f) => `"${f}"`).join(",");

  const queryParams: string[] = [];

  if (options?.query) {
    queryParams.push(`q=${options.query}`);
  }

  if (options?.offset) {
    queryParams.push(`start=${options.offset}`);
  }

  if (options?.limit || options?.limit == 0) {
    queryParams.push(`rows=${options.limit}`);
  }

  if (options?.sort) {
    queryParams.push(`sort=${options?.sort}`);
  }

  const fqList: string[] = [];

  if (options?.fq) {
    fqList.push(options.fq);
  }

  const fqListGroups: string[] = [];

  if (owner_org) {
    fqListGroups.push(`owner_org:${owner_org}`);
  } else if (options?.orgs?.length) {
    fqListGroups.push(`organization:(${joinTermsWithOr(options?.orgs)})`);
  }

  if (options?.groups?.length) {
    fqListGroups.push(`groups:(${joinTermsWithOr(options?.groups)})`);
  }

  if (options?.resFormat?.length) {
    fqListGroups.push(`res_format:(${joinTermsWithOr(options.resFormat)})`);
  }

  if (options?.tags?.length) {
    fqListGroups.push(`tags:(${joinTermsWithOr(options.tags)})`);
  }

  if (fqListGroups?.length) {
    fqList.push(`+(${fqListGroups.join(" AND ")})`);
  }

  if (fqList?.length) {
    queryParams.push(`fq=${fqList.join(" ")}`);
  }

  const action = `${baseAction}?${queryParams.join(
    "&"
  )}&facet.field=[${_facetFields}]&facet.limit=9999`;

  const res = await fetchJsonRetry<CkanResponse<PackageSearchResponse>>({
    url: `${DMS}/api/3/action/${action}`,
    retries: 3,
    opts: { next: { revalidate: ISR_REVALIDATE_SECONDS } },
  });

  return { ...res.result, datasets: res.result.results };
}

export async function getDatasetDetails(datasetName: string) {
  const response = await fetchRetry(
    `${DMS}/api/3/action/package_show?id=${datasetName}`,
    1,
    {
      next: { revalidate: ISR_REVALIDATE_SECONDS },
    }
  );
  if (!response.ok) {
    throw new Error(
      `Failed to fetch dataset: ${response.status} ${response.statusText}`
    );
  }
  const responseData = await response.json();
  if (responseData.success === false) {
    throw new Error("Could not find dataset");
  }
  const dataset: Dataset = responseData.result;
  return dataset;
}

export const getDataset = async ({ name }: { name: string }) => {
  const dataset = await getDatasetDetails(name);
  return dataset;
};

export const getGroupsFromFacets= async () => {
  const response = await searchDatasets({
    options: {
      limit: 0,
    },
    facetFields: ["groups"],
  });
  const groups  = response.search_facets?.groups?.items || [];
  return groups
};
