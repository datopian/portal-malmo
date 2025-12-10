import { fetchRetry, NextFetchOptions } from "@/lib/utils";
import { Activity } from "@/schemas/ckan/activity.interface";
import {
  Dataset,
  DatasetListQueryOptions,
  PackageSearchOptions,
  PackageSearchResponse,
  Resource,
  Tag,
} from "@/schemas/ckan/dataset.interface";
import {
  ResourceInfo,
  TableMetadata,
} from "@/schemas/ckan/datastore.interface";
import { Group } from "@/schemas/ckan/group.interface";
import { Organization } from "@/schemas/ckan/organization.interface";
import { User } from "@/schemas/ckan/user.interface";
import { ISR_REVALIDATE_SECONDS } from "../isr";

export default class CKAN {
  DMS: string;

  constructor(DMS: string = process.env.NEXT_PUBLIC_DMS ?? "") {
    if (!DMS) {
      throw new Error(
        "DMS URL is not defined. Please set the NEXT_PUBLIC_DMS environment variable."
      );
    }
    this.DMS = DMS;
  }

  async getDatasetsList() {
    const response = await fetchRetry(
      `${this.DMS}/api/3/action/package_list`,
      3
    );
    const responseData = await response.json();
    return responseData.result;
  }

  async getDatasetsListWithDetails(
    options: DatasetListQueryOptions
  ): Promise<Array<Dataset>> {
    const sort = options.sort || "metadata_modified desc";
    const response = await fetchRetry(
      `${this.DMS}/api/3/action/current_package_list_with_resources?offset=${options.offset}&limit=${options.limit}&sort=${sort}`,
      3
    );
    if (!response.ok) {
      throw new Error(
        `Failed to fetch datasets list: ${response.status} ${response.statusText}`
      );
    }
    const responseData = await response.json();
    if (responseData.success === false) {
      throw new Error("Failed to retrieve datasets list");
    }
    const datasets: Array<Dataset> = responseData.result;
    return datasets;
  }

  async packageSearch(
    options: PackageSearchOptions,
    reqOptions: NextFetchOptions = {}
  ): Promise<PackageSearchResponse> {
    const facetFields = ["groups", "organization", "res_format", "tags"]
      .map((f) => `"${f}"`)
      .join(",");

    function buildGroupsQuery(groups: Array<string>) {
      if (groups.length > 0) {
        return `groups:(${groups.join(" OR ")})`;
      }
      return "";
    }
    function buildOrgsQuery(orgs: Array<string>) {
      if (orgs.length > 0) {
        return `organization:(${orgs.join(" OR ")})`;
      }
      return "";
    }
    function buildTagsQuery(tags: Array<string>) {
      if (tags.length > 0) {
        return `tags:(${tags.join(" OR ")})`;
      }
      return "";
    }

    function buildResFormatQuery(resFormat: Array<string>) {
      if (resFormat?.length > 0) {
        return `res_format:(${resFormat.join(" OR ")})`;
      }
      return "";
    }

    function buildFq(
      tags: Array<string>,
      orgs: Array<string>,
      groups: Array<string>,
      resFormat: Array<string>
    ) {
      //TODO; this query builder is not very robust
      // convertToCkanSearchQuery function should be
      //copied over from the old portals utils
      const fq = [
        buildGroupsQuery(groups),
        buildOrgsQuery(orgs),
        buildTagsQuery(tags),
        buildResFormatQuery(resFormat),
      ].filter((str) => str !== "");
      if (fq.length > 0) {
        return "&fq=" + fq.join("+");
      }
      return null;
    }

    const fq = buildFq(
      options.tags ?? [],
      options.orgs ?? [],
      options.groups ?? [],
      options?.resFormat ?? []
    );

    let url = `${this.DMS}/api/3/action/package_search?`;

    url += `start=${options.offset ?? 0}`;
    url += `&rows=${options.limit ?? 10}`;
    url += fq ? fq : "";
    url += options.query ? "&q=" + options.query : "";
    url += options.sort ? "&sort=" + options.sort : "";
    url += options.include_private
      ? "&include_private=" + options.include_private
      : "";
    url += `&facet.field=[${encodeURIComponent(facetFields)}]&facet.limit=9999`;

    const response = await fetchRetry(url, 3, {
      ...reqOptions,
      next: {
        revalidate: ISR_REVALIDATE_SECONDS,
      },
    });
    const responseData = await response.json();
    const datasets: Array<Dataset> = responseData.result.results;

    return { datasets, ...responseData.result };
  }

  async getDatasetDetails(datasetName: string) {
    const response = await fetchRetry(
      `${this.DMS}/api/3/action/package_show?id=${datasetName}`,
      1,
      {
        next: {
          revalidate: ISR_REVALIDATE_SECONDS,
        },
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

  async getDatasetActivityStream(datasetName: string) {
    const response = await fetchRetry(
      `${this.DMS}/api/3/action/package_activity_list?id=${datasetName}`,
      3,
      {
        next: {
          revalidate: ISR_REVALIDATE_SECONDS,
        },
      }
    );
    const responseData = await response.json();
    const activitiesWithoutUserData: Array<Activity> = responseData.result;
    const activities = await Promise.all(
      activitiesWithoutUserData.map(async (item) => {
        let user_data: User | null = await this.getUser(item.user_id);
        user_data = user_data === undefined ? null : user_data;
        return { ...item, user_data };
      })
    );
    return activities;
  }

  async getUser(userId: string) {
    try {
      const response = await fetchRetry(
        `${this.DMS}/api/3/action/user_show?id=${userId}`,
        3
      );
      const responseData = await response.json();
      const user: User | null =
        responseData.success === true ? responseData.result : null;
      return user;
    } catch {
      return null;
    }
  }

  async getGroupList() {
    const response = await fetchRetry(`${this.DMS}/api/3/action/group_list`, 3);
    const responseData = await response.json();
    const groups: Array<string> = responseData.result;
    return groups;
  }

  async getGroupsWithDetails() {
    const response = await fetchRetry(
      `${this.DMS}/api/3/action/group_list?all_fields=True&limit=1000`,
      3
    );
    const responseData = await response.json();
    const groups: Array<Group> = responseData.result;
    return groups;
  }

  async getGroupDetails(groupName: string) {
    const response = await fetchRetry(
      `${this.DMS}/api/3/action/group_show?id=${groupName}&include_datasets=True`,
      3
    );
    const responseData = await response.json();
    const group: Group = responseData.result;
    return group;
  }

  async getGroupActivityStream(groupName: string) {
    const response = await fetchRetry(
      `${this.DMS}/api/3/action/group_activity_list?id=${groupName}`,
      3
    );
    const responseData = await response.json();
    const activitiesWithoutUserData: Array<Activity> = responseData.result;
    const activities = await Promise.all(
      activitiesWithoutUserData.map(async (item) => {
        let user_data = await this.getUser(item.user_id);
        user_data = user_data === undefined ? null : user_data;
        return { ...item, user_data };
      })
    );
    return activities;
  }

  async getOrgList(limit: number = 1000) {
    const response = await fetchRetry(
      `${this.DMS}/api/3/action/organization_list?limit=${limit}`,
      3
    );
    const responseData = await response.json();
    const organizations: Array<string> = responseData.result;
    return organizations;
  }

  async getOrgsWithDetails(accrossPages?: boolean, limit: number = 25) {
    if (!accrossPages) {
      const response = await fetchRetry(
        `${this.DMS}/api/3/action/organization_list?all_fields=True&limit=${limit}`,
        3
      );
      const responseData = await response.json();
      const organizations: Array<Organization> = responseData.result;
      return organizations;
    }

    const organizations = [];
    const orgListResponse = await fetchRetry(
      `${this.DMS}/api/3/action/organization_list`,
      3
    );
    const orgList = await orgListResponse.json();
    const orgLen = orgList.result.length;
    const pages = Math.ceil(orgLen / limit);

    for (let i = 0; i < pages; i++) {
      const allOrgListResponse = await fetchRetry(
        `${this.DMS}/api/3/action/organization_list?all_fields=True&offset=${
          i * limit
        }&limit=${limit}`,
        3
      );
      const responseData = await allOrgListResponse.json();
      const result: Array<Organization> = responseData.result;
      organizations.push(...result);
    }
    return organizations.sort((a, b) => b.package_count - a.package_count);
  }

  async getOrgDetails(orgName: string) {
    const response = await fetchRetry(
      `${this.DMS}/api/3/action/organization_show?id=${orgName}&include_datasets=True`,
      3
    );
    const responseData = await response.json();
    const organization: Organization = responseData.result;
    return organization;
  }

  async getOrgActivityStream(orgName: string) {
    const response = await fetchRetry(
      `${this.DMS}/api/3/action/organization_activity_list?id=${orgName}`,
      3
    );
    const responseData = await response.json();
    const activitiesWithoutUserData: Array<Activity> = responseData.result;
    const activities = await Promise.all(
      activitiesWithoutUserData.map(async (item) => {
        let user_data = await this.getUser(item.user_id);
        user_data = user_data === undefined ? null : user_data;
        return { ...item, user_data };
      })
    );
    return activities;
  }

  async getAllTags() {
    const response = await fetchRetry(
      `${this.DMS}/api/3/action/tag_list?all_fields=True`,
      3
    );
    const responseData = await response.json();
    const tags: Array<Tag> = responseData.result;
    return tags;
  }

  async getResourcesWithAliasList() {
    const response = await fetchRetry(
      `${this.DMS}/api/3/action/datastore_search`,
      2,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: "_table_metadata",
          limit: 32000,
        }),
      }
    );
    if (!response.ok) {
      throw new Error(
        `Failed to fetch resources with aliases: ${response.status} ${response.statusText}`
      );
    }
    const responseData = await response.json();
    if (responseData.success === false) {
      throw new Error("Failed to retrieve resources with aliases");
    }
    const tableMetadata: Array<TableMetadata> = responseData.result.records;
    return tableMetadata.filter((item) => item.alias_of);
  }

  async datastoreSearch(resourceId: string) {
    const response = await fetchRetry(
      `${this.DMS}/api/3/action/datastore_search`,
      2,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: resourceId,
          limit: "32000",
        }),
      }
    );
    const responseData = await response.json();
    return responseData.result.records;
  }

  async getResourceMetadata(resourceId: string) {
    const response = await fetchRetry(
      `${this.DMS}/api/3/action/resource_show?id=${resourceId}`,
      3
    );
    const responseData = await response.json();
    const resourceMetadata: Resource = responseData.result;
    return resourceMetadata;
  }

  async getResourceInfo(resourceId: string) {
    const response = await fetchRetry(
      `${this.DMS}/api/3/action/datastore_info`,
      2,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ resource_id: resourceId }),
      }
    );
    const responseData = await response.json();
    const resourceInfo: Array<ResourceInfo> = responseData.result;
    return resourceInfo;
  }

  async getFacetFields(field: "res_format" | "tags") {
    const response = await fetchRetry(
      `${this.DMS}/api/3/action/package_search?facet.field=["${field}"]&rows=0`,
      3
    );
    const responseData = await response.json();
    const result = responseData.result?.facets?.[field];
    return result ? Object.keys(result) : [];
  }
}
