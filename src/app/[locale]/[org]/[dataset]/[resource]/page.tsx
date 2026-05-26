import { Metadata } from "next";
import { formatDate } from "date-fns";
import { DownloadIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import Page from "@/components/layout/Page";
import ApiDialog from "@/components/package/api/ApiDialog";
import ResourcePreview from "@/components/package/resource/ResourcePreview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Container from "@/components/ui/container";
import { Link } from "@/i18n/navigation";
import { ckan } from "@/lib/ckan";
import {
  getLocalizedText,
  getLocalizedTextWithLang,
} from "@/lib/ckan-translations";
import { getResourceColor, supportsPreview } from "@/lib/resource";
import { buildLocalizedMetadata } from "@/lib/seo";
import { formatFileSize } from "@/lib/utils";
import { Dataset, Resource } from "@/schemas/ckan";

export const revalidate = 150;

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

type LoadedResourcePageData = {
  dataset: Dataset;
  resource: Resource;
};

function ensureSupportedOrganization(org: string) {
  if (decodeURIComponent(org) !== "@malmo") {
    notFound();
  }
}

async function loadResourcePageData(
  datasetName: string,
  resourceId: string,
): Promise<LoadedResourcePageData> {
  try {
    const dataset = await ckan().getDatasetDetails(datasetName);
    if (!dataset || !resourceId) {
      notFound();
    }

    const resource = await ckan().getResourceMetadata(resourceId);
    if (!resource || resource.package_id !== dataset.id) {
      notFound();
    }

    return { dataset, resource };
  } catch (error) {
    console.error(error);
    notFound();
  }
}

function buildResourceBreadcrumbs({
  t,
  locale,
  dataset,
  resource,
  resourceTitle,
}: {
  t: Awaited<ReturnType<typeof getTranslations>>;
  locale: string;
  dataset: Dataset;
  resource: Resource;
  resourceTitle: string;
}) {
  return [
    {
      title: t("Common.search"),
      href: "/data",
    },
    {
      title: getLocalizedText(
        dataset.title_translated,
        locale,
        dataset.title ?? dataset.name,
      ),
      href: `/@malmo/${dataset.name ?? ""}`,
    },
    {
      title: resourceTitle,
      href: `/@malmo/${dataset.name ?? ""}/${resource.id}`,
      current: true,
    },
  ];
}

function formatResourceDate(value?: string | null) {
  return value ? formatDate(value, "dd/MM/yyyy, HH:mm") : "--";
}

function formatResourceSize(value?: number | null) {
  return typeof value === "number" ? formatFileSize(value) : "--";
}

export default async function ResourcePage({ params }: PageProps) {
  const { locale, org, dataset: datasetName, resource: resourceId } = await params;

  ensureSupportedOrganization(org);

  const t = await getTranslations({ locale });
  const { dataset, resource } = await loadResourcePageData(datasetName, resourceId);
  const resourceTitle = getLocalizedTextWithLang(
    resource.name_translated,
    locale,
    resource.name,
  );
  const resourceDescription = getLocalizedTextWithLang(
    resource.description_translated,
    locale,
    resource.description,
  );

  return (
    <Page
      breadcrumb={{
        items: buildResourceBreadcrumbs({
          t,
          locale,
          dataset,
          resource,
          resourceTitle: resourceTitle.text,
        }),
      }}
      title={resourceTitle.text}
      titleLang={resourceTitle.lang}
      description={resourceDescription.text}
      descriptionLang={resourceDescription.lang}
    >
      <Container className="py-12">
        <div className="mb-8 flex flex-col gap-6 border-b pb-8 md:flex-row sm:gap-12">
          <div className="flex flex-col gap-6 sm:flex-row sm:gap-12">
            <div>
              <span className="block font-bold">{t("Common.format")}</span>
              <span>
                {resource.format ? (
                  <Badge
                    className="font-bold"
                    style={{ backgroundColor: getResourceColor(resource.format) }}
                  >
                    {resource.format}
                  </Badge>
                ) : (
                  "--"
                )}
              </span>
            </div>
            <div>
              <span className="block font-bold">{t("Common.lastModified")}</span>
              <span>{formatResourceDate(resource.metadata_modified)}</span>
            </div>
            <div>
              <span className="block font-bold">{t("Common.size")}</span>
              <span>{formatResourceSize(resource.size)}</span>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <ApiDialog
              type="resource"
              includeDatastore={resource.datastore_active}
              id={resource.id}
            />
            <Button
              type="button"
              asChild
              aria-label={`${t("Common.download")} ${resourceTitle.text}`}
              variant="theme"
            >
              <Link href={resource.url ?? ""} target="_blank" download>
                <DownloadIcon aria-hidden="true" size={20} />
                {t("Common.download")}
              </Link>
            </Button>
          </div>
        </div>

        {supportsPreview(resource) && <ResourcePreview resource={resource} dataset={dataset} />}
      </Container>
    </Page>
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, org, dataset, resource } = await params;
  const resourceData = await ckan().getResourceMetadata(resource);

  return buildLocalizedMetadata({
    locale,
    pathname: `/${decodeURIComponent(org)}/${dataset}/${resource}`,
    title: resourceData
      ? getLocalizedText(resourceData.name_translated, locale, resourceData.name)
      : decodeURIComponent(resource),
    description: resourceData
      ? getLocalizedText(
          resourceData.description_translated,
          locale,
          resourceData.description,
        )
      : "",
  });
}
