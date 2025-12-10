import { Dataset } from "@/schemas/ckan";
import { ckan } from "@/lib/ckan";
import Page from "@/components/layout/Page";
import { DatasetExport } from "@/components/package";
import DatasetInfo from "@/components/package/dataset/DatasetInfo";
import DatasetResources from "@/components/package/dataset/DatasetResource";
import { notFound } from "next/navigation";
import ApiTabs from "@/components/package/api/ApiTab";
import ActivityStream from "@/components/activity/ActivityStream";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import { buildLocalizedMetadata } from "@/lib/seo";

type DatasetPageParams = {
  locale: string;
  org: string;
  dataset: string;
};

type DatasetPageProps = {
  params: Promise<DatasetPageParams>;
};

export const revalidate = 300;

export async function generateStaticParams(): Promise<
  Array<{ org: string; dataset: string }>
> {
  return [];
}

export default async function DatasetPage({ params }: DatasetPageProps) {
  let dataset: Dataset | null = null;

  const { locale, dataset: datasetName, org } = await params;

  const t = await getTranslations({ locale });

  let orgName = decodeURIComponent(org);

  if(!orgName.includes("@")) {
    return notFound();
  }

  orgName = orgName.split("@")[1];

  try {
    if (!datasetName || !orgName) {
      return notFound();
    }

    dataset = await ckan().getDatasetDetails(datasetName);

    if (!dataset) {
      return notFound();
    }
    
    if(orgName !== dataset?.organization?.name) {
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
            title: dataset.organization?.title ?? t("Common.organization"),
            href: `/@${dataset.organization?.name}`,
          },
        ],
      }}
      title={dataset?.title ?? ""}
      description={dataset.notes}
      heroContent={<DatasetExport dataset={dataset} className="mt-3" />}
      tabs={[
        {
          id: "resources",
          title: t("Common.resources"),
          subtitle: t("Dataset.resourcesTitle", {
            count: dataset.resources.length,
          }),
          content: (
            <DatasetResources
              organization={dataset.organization?.name ?? ""}
              dataset={dataset.name}
              resources={dataset?.resources || []}
            />
          ),
        },
        {
          id: "info",
          title: t("Common.metadata"),
          content: <DatasetInfo dataset={dataset} />,
        },
        {
          id: "api",
          title: t("Common.api"),
          content: <ApiTabs name={dataset.name} action="package_show" />,
        },
        {
          id: "activities",
          title: t("Common.activityStream"),
          content: <ActivityStream type="package" id={dataset.name} />,
        },
      ]}
    />
  );
}

export async function generateMetadata({
  params,
}: DatasetPageProps): Promise<Metadata> {
  const { locale, org, dataset } = await params;
  const ds = await ckan().getDatasetDetails(dataset);
  const datasetTitle = ds?.title ?? decodeURIComponent(dataset);
  const description = ds?.notes??"";

  return buildLocalizedMetadata({
    locale,
    pathname: `/${decodeURIComponent(org)}/${dataset}`,
    title: datasetTitle,
    description,
  });
}