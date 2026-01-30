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
import DatasetInfo from "@/components/package/dataset/DatasetInfo";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import { formatDate } from "date-fns";

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

  if(decodeURIComponent(org) !== "@malmo"){
    return notFound();
  }

  const t = await getTranslations({ locale });

  try {
    if (!datasetName ) {
      return notFound();
    }

    dataset = await ckan().getDatasetDetails(datasetName);

    if (!dataset) {
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
            href: `/@malmo/${dataset.name}`,
            current: true,
          },
        ],
      }}
      title={dataset?.title ?? ""}
      description={dataset.notes}
      metadata={[
        {
          title: t("Common.updated"),
          value: formatDate(
            dataset.metadata_modified ?? "",
            "dd/MM/yyyy, HH:mm:ss"
          ),
        }
      ]}
    >
      <Container className="py-12">
        <div className="flex flex-col lg:flex-row gap-10">
          <div className=" w-full">
            <Heading level={3} className="text-[24px] font-bold">
              {t("Dataset.resourcesCount", {
                count: dataset?.resources?.length,
              })}
            </Heading>
            <DatasetResources
              resources={dataset.resources}
              dataset={dataset.name}
              organization={"malmo"}
            />
          </div>

          <div className="w-full lg:max-w-[350px] space-y-6 lg:ml-auto lg:sticky top-10 h-fit">
            <div className="p-6 bg-[#F3F3F3]">
              <Heading
                level={3}
                className="font-bold text-[#444444] text-[24px]"
              >
                {t("Common.metadata")}
              </Heading>
              <div className="mt-5">
                <DatasetInfo dataset={dataset} />
              </div>
            </div>

            <div className="p-6 bg-[#F3F3F3]">
              <Heading
                level={3}
                className="font-bold text-[#444444] text-[24px]"
              >
                {t("Common.tags")}
              </Heading>
              <div className="mt-5 flex gap-3 flex-wrap">
                {dataset.tags?.map((t) => (
                  <Link href={`/data?tags=${t.name}`} key={t.id}>
                    <Badge
                      variant={"outline"}
                      className="px-3 py-1 bg-white rounded-lg"
                    >
                      {t.display_name}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
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
