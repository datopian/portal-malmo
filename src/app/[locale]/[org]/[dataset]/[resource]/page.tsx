import { Dataset, Organization, Resource } from "@/schemas/ckan";
import { ckan } from "@/lib/ckan";
import Page from "@/components/layout/Page";
import { Badge } from "@/components/ui/badge";
import { notFound } from "next/navigation";
import React from "react";
import { RESOURCE_COLORS, supportsPreview } from "@/lib/resource";
import ResourcePreview from "@/components/package/resource/ResourcePreview";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import { buildLocalizedMetadata } from "@/lib/seo";
import { getOrganization } from "@/lib/ckan/organization";
import Container from "@/components/ui/container";
import { formatDate } from "date-fns";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { DownloadIcon } from "lucide-react";
import { Heading } from "@/components/ui/heading";
import { formatFileSize } from "@/lib/utils";

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

    if (!orgName.includes("@")) {
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

    if (dataset?.organization?.name !== orgName) {
      return notFound();
    }

    if (resource.package_id !== dataset.id) {
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
            title: t("Common.search"),
            href: "/data",
          },
          {
            title: dataset?.title ?? t("Common.dataset"),
            href: `/@${dataset?.organization?.name}/${dataset?.name ?? ""}`,
          },
          {
            title: resource?.name ?? t("Common.resource"),
            href: `/@${dataset?.organization?.name}/${dataset?.name ?? ""}/${
              resource.name
            }`,
            current: true,
          },
        ],
      }}
      title={resource.name ?? ""}
      description={resource.description}
    >
      <Container className="py-12">
        <div className="flex gap-6 sm:gap-12 border-b pb-8 mb-8">
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-12">
            <div>
              <span className="font-bold block">{t("Common.format")}</span>
              <span>
                {resource.format ? (
                  <Badge
                    className="font-bold"
                    style={{
                      backgroundColor:
                        RESOURCE_COLORS[resource.format?.toLocaleLowerCase()] ??
                        RESOURCE_COLORS.default,
                    }}
                  >
                    {resource.format}
                  </Badge>
                ) : (
                  "--"
                )}
              </span>
            </div>
            <div>
              <span className="font-bold block">
                {t("Common.lastModified")}
              </span>
              <span>
                {formatDate(
                  resource.metadata_modified ?? "",
                  "dd/MM/yyyy, hh:mm"
                )}
              </span>
            </div>
            <div>
              <span className="font-bold block">{t("Common.size")}</span>
              <span>
                {resource.size ? formatFileSize(resource.size) : "--"}
              </span>
            </div>
          </div>
          <div className="ml-auto">
            <Button
              type="button"
              asChild
              aria-label={`Download resource ${resource.name}`}
              variant={"theme"}
              className="bg-[#666666] px-3 font-medium border-[#666666] border-1 text-white hover:bg-[#666666]/90"
            >
              <Link href={resource.url ?? ""} target="_blank" download={true}>
                <DownloadIcon size={5} />
                {t("Common.download")}
              </Link>
            </Button>
          </div>
        </div>
        {resource.format && supportsPreview(resource) && (
          <>
            <Heading level={3} className="text-theme-green font-bold mb-5">
              {t("Common.preview")}
            </Heading>
            <ResourcePreview resource={resource} />
          </>
        )}
      </Container>
    </Page>
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
