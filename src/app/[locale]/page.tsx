import Page from "@/components/layout/Page";
import DatasetCard from "@/components/package/dataset/DatasetCard";
import SearchForm from "@/components/package/search/SearchForm";
import { Button } from "@/components/ui/button";
import Container from "@/components/ui/container";
import { Heading } from "@/components/ui/heading";
import { searchDatasets } from "@/lib/ckan/dataset";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

type Props = { params: Promise<{ locale: string }> };


export const revalidate = 300;

export async function generateMetadata({params}:Props):Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({locale});
  return {
    title: t("Site.title"),
    alternates: {
      canonical: "/",
    },
  };
}

export default async function Home() {
  const t = await getTranslations();
  const { datasets } = await searchDatasets({
    options: {
      limit: 4,
    },
  });
  return (
    <Page title={t("Home.title")} description={t("Home.tagline")}>
      <Container className="-mt-6">
        <SearchForm />
        <div className="my-10">
          <div className="space-y-5">
            <div className="flex items-center">
              <Heading level={3} className="">
                {t("Dataset.latest")}
              </Heading>
              <Button asChild className="ml-auto" variant="secondary">
                <Link href={"/search"}>{t("Common.exploreAll")}</Link>
              </Button>
            </div>
            <div className="grid grid-cols-4 gap-5">
              {datasets?.map((dataset) => (
                <DatasetCard
                  key={dataset.id}
                  dataset={dataset}
                  linkClassName="h-full"
                  cardClassName="h-full"
                />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </Page>
  );
}
