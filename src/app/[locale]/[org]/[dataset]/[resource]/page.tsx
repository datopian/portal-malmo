import { Dataset, Organization, Resource } from "@/schemas/ckan";
import { ckan } from "@/lib/ckan";
import Page from "@/components/layout/Page";
import ApiTabs from "@/components/package/api/ApiTab";
import ResourceDetails from "@/components/package/resource/ResourceDetails";
import { Badge } from "@/components/ui/badge";
import { notFound } from "next/navigation";
import React from "react";
import { supportsPreview } from "@/lib/resource";
import ResourcePreview from "@/components/package/resource/ResourcePreview";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import { buildLocalizedMetadata } from "@/lib/seo";
import { getOrganization } from "@/lib/ckan/organization";

export const revalidate = 300;

export async function generateStaticParams(): Promise<
  Array<{ org: string; dataset: string; resource: string }>
> {
  return [];
}

type ResourcePageParams = {
  locale: string;
  org: string;
  dataset: string;
  resource: string;
};

type PageProps = {
  params: Promise<ResourcePageParams>;
};

export default async function ResourcePage({ params }: PageProps) {
  let resource: Resource | null = null;
  let dataset: Dataset | null = null;
  let organization: Organization | null = null;

  const {
    locale,
    resource: resourceId,
    dataset: datasetName,
    org,
  } = await params;

  const t = await getTranslations({ locale });

  try {
    if (!resourceId || !datasetName || !org) {
      return notFound();
    }

    let orgName = decodeURIComponent(org);

    if(!orgName.includes("@")) {
      return notFound();
    }

    orgName = orgName.split("@")[1];

    organization = await getOrganization({
      name: orgName as string,
      include_datasets: false,
    });

    if (!organization) {
      return notFound();
    }

    dataset = await ckan().getDatasetDetails(datasetName);

    if (!dataset) {
      return notFound();
    }

    resource = await ckan().getResourceMetadata(resourceId);

    if (!resource) {
      return notFound();
    }

    if(dataset?.organization?.name !== orgName) {
      return notFound();
    }

    if(resource.package_id !== dataset.id) {
      return notFound();
    }

    
  } catch (e) {
    console.log(e);
    return notFound();
  }

  return (
    <Page
      breadcrumb={{
        items: [
          {
            title: t("Common.organizations"),
            href: "/organizations",
          },
          {
            title: dataset?.organization?.title ?? t("Common.organization"),
            href: `/@${dataset?.organization?.name}`,
          },
          {
            title: dataset?.title ?? t("Common.dataset"),
            href: `/@${dataset?.organization?.name}/${dataset?.name ?? ""}`,
          },
        ],
      }}
      title={resource.name ?? ""}
      description={resource.description}
      metadata={[
        ...(resource.format
          ? [
              {
                title: "",
                value: <Badge>{resource.format}</Badge>,
              },
            ]
          : []),
      ]}
      actions={[
        {
          title: t("Common.download"),
          href: resource.url,
        },
      ]}
      tabs={[
        ...(resource.format && supportsPreview(resource)
          ? [
              {
                id: "preview",
                title: t("Common.preview"),
                content: <ResourcePreview resource={resource} />,
              },
            ]
          : []),
        {
          id: "details",
          title: t("Common.metadata"),
          content: (
            <ResourceDetails
              resource={{
                ...resource,
                dataset: dataset,
              }}
            />
          ),
        },
        {
          id: "api",
          title: t("Common.api"),
          content: <ApiTabs name={resource.id} action="resource_show" />,
        },
      ]}
    />
  );
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, org, dataset, resource } = await params;
  const resData = await ckan().getResourceMetadata(resource);
  const resourceName = resData?.name ?? decodeURIComponent(resource);
  const description = resData?.description ?? "";

  return buildLocalizedMetadata({
    locale,
    pathname: `/${decodeURIComponent(org)}/${dataset}/${resource}`,
    title: resourceName,
    description,
  });
}
