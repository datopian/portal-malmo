import { Dataset } from "@/schemas/ckan";
import { ckan } from "@/lib/ckan";
import Page from "@/components/layout/Page";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import { buildLocalizedMetadata } from "@/lib/seo";
import Container from "@/components/ui/container";
import { Heading } from "@/components/ui/heading";
import { DatasetResources } from "@/components/package";

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

  if (!orgName.includes("@")) {
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

    if (orgName !== dataset?.organization?.name) {
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
            title: dataset?.title ?? "",
            href: `/@${dataset.organization?.name}/${dataset.name}`,
          },
        ],
      }}
      title={dataset?.title ?? ""}
      description={dataset.notes}
    >
      <Container className="py-12">
        <Heading level={3} className="text-[24px] font-bold">
          {t("Dataset.resourcesCount", { count: dataset?.resources?.length })}
        </Heading>

        {dataset?.resources && dataset.resources.length > 0 && (
          <div className="mt-6">
            <DatasetResources
              resources={dataset.resources}
              dataset={dataset.name}
              organization={dataset.organization?.name || ""}
            />
          </div>
        )}
      </Container>
    </Page>
  );
}

export async function generateMetadata({
  params,
}: DatasetPageProps): Promise<Metadata> {
  const { locale, org, dataset } = await params;
  const ds = await ckan().getDatasetDetails(dataset);
  const datasetTitle = ds?.title ?? decodeURIComponent(dataset);
  const description = ds?.notes ?? "";

  return buildLocalizedMetadata({
    locale,
    pathname: `/${decodeURIComponent(org)}/${dataset}`,
    title: datasetTitle,
    description,
  });
}
