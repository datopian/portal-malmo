import { Organization } from "@/schemas/ckan";
import  { CkanResponse } from "@portaljs/ckan-api-client-js";
import { fetchJsonRetry } from "../utils";
import { ISR_REVALIDATE_SECONDS } from "../isr";

const DMS = process.env.NEXT_PUBLIC_DMS;

export const getOrganization = async ({
  name,
  include_datasets = false,
}: {
  name: string;
  include_datasets?: boolean;
}) => {

  try {
    const organization = await fetchJsonRetry<CkanResponse<Organization>>({
      url: `${DMS}/api/3/action/organization_show?id=${name}&include_datasets=${include_datasets}`,
      opts: { next: { revalidate: ISR_REVALIDATE_SECONDS } },
    });
    return organization.result;
  } catch (err) {
    console.error("Failed to fetch organization:", err);
    return null;
  }
};

export const getAllOrganizations = async ({
  detailed = true,
}: {
  detailed?: boolean;
}) => {

  const organizations = await fetchJsonRetry<CkanResponse<Organization[]>>({
    url: `${DMS}/api/3/action/organization_list?all_fields=${
      detailed ? "True" : "False"
    }`,
    opts: { next: { revalidate: ISR_REVALIDATE_SECONDS } },
  });

  return organizations.result;
};
