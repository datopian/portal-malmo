import { Dataset, Resource } from "@/schemas/ckan";
import { ckan } from "@/lib/ckan";
import Page from "@/components/layout/Page";
import { Badge } from "@/components/ui/badge";
import { notFound } from "next/navigation";
import { RESOURCE_COLORS, supportsPreview } from "@/lib/resource";
import ResourcePreview from "@/components/package/resource/ResourcePreview";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import { buildLocalizedMetadata } from "@/lib/seo";
import Container from "@/components/ui/container";
import { formatDate } from "date-fns";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { DownloadIcon } from "lucide-react";
import { formatFileSize } from "@/lib/utils";
import ApiDialog from "@/components/package/api/ApiDialog";
import { getLocalizedText } from "@/lib/ckan-translations";

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

  const {
    locale,
    resource: resourceId,
    dataset: datasetName,
    org,
  } = await params;

  if (decodeURIComponent(org) !== "@malmo") {
    return notFound();
  }

  const t = await getTranslations({ locale });

  try {
    dataset = await ckan().getDatasetDetails(datasetName);

    if (!dataset) {
      return notFound();
    }

    if (!resourceId) {
      return notFound();
    }

    resource = await ckan().getResourceMetadata(resourceId);

    if (!resource) {
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
            title: dataset
              ? getLocalizedText(
                  dataset.title_translated,
                  locale,
                  dataset.title ?? dataset.name
                )
              : t("Common.dataset"),
            href: `/@malmo/${dataset?.name ?? ""}`,
          },
          {
            title: resource
              ? getLocalizedText(
                  resource.name_translated,
                  locale,
                  resource.name
                )
              : t("Common.resource"),
            href: `/@malmo/${dataset?.name ?? ""}/${resource.id}`,
            current: true,
          },
        ],
      }}
      title={getLocalizedText(resource.name_translated, locale, resource.name)}
      description={getLocalizedText(
        resource.description_translated,
        locale,
        resource.description
      )}
    >
      <Container className="py-12">
        <div className="flex flex-col md:flex-row gap-6 sm:gap-12 border-b pb-8 mb-8">
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
                  "dd/MM/yyyy, HH:mm",
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
          <div className="ml-auto flex items-center gap-2">
            <ApiDialog type="resource" includeDatastore={resource.datastore_active } id={resource.id}/>
            <Button
              type="button"
              asChild
              aria-label={`Download resource ${getLocalizedText(
                resource.name_translated,
                locale,
                resource.name
              )}`}
              variant={"theme"}
      
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
            <ResourcePreview resource={resource} dataset={dataset} />
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
  const resourceName = resData
    ? getLocalizedText(resData.name_translated, locale, resData.name)
    : decodeURIComponent(resource);
  const description = resData
    ? getLocalizedText(
        resData.description_translated,
        locale,
        resData.description
      )
    : "";

  return buildLocalizedMetadata({
    locale,
    pathname: `/${decodeURIComponent(org)}/${dataset}/${resource}`,
    title: resourceName,
    description,
  });
}
