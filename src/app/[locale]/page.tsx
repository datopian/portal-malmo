import GroupCard from "@/components/groups/GroupCard";
import Hero from "@/components/layout/PageHero";
import DatasetSimpleCard from "@/components/package/dataset/DatasetSimpleCard";
import SearchForm from "@/components/package/search/SearchForm";
import { Button } from "@/components/ui/button";
import Container from "@/components/ui/container";
import { Heading } from "@/components/ui/heading";
import { ckan } from "@/lib/ckan";
import { searchDatasets } from "@/lib/ckan/dataset";
import { GROUP_CARD_COLORS } from "@/lib/groups";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

type Props = { params: Promise<{ locale: string }> };

export const revalidate = 300;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
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
      limit: 3,
      sort: "metadata_modified desc",
    },
  });

  const groups = await ckan().getGroupsWithDetails();

  return (
    <>
      <Hero
        style="home"
        title={
          <span className="font-semibold">
            {t("Home.title")}{" "}
            <span className="text-theme-green-light">
              {t("Home.titleStrong")}
            </span>
          </span>
        }
        description={t("Home.tagline")}
      >
        <div className="mb-[50px]">
          <SearchForm
            title={t("Dataset.searchLabel")}
            placeholder={t("Search.searchPlaceholder")}
          />
        </div>
      </Hero>
      <Container>
        <div className="my-12">
          <div className="space-y-5">
            <div className="flex flex-col gap-5">
              <Heading level={3} className="">
                {t("GroupsPage.discoverGroups")}
              </Heading>
              <Button asChild variant="theme" className="w-fit">
                <Link href={"/themes"}>{t("Common.groups")}</Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {groups?.map((group, i) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  colorClass={GROUP_CARD_COLORS[i]}
                />
              ))}
            </div>
          </div>
        </div>
      </Container>
      <div className="bg-[#EFEDEB] py-12">
        <Container>
          <div className="space-y-8">
            <Heading level={3} className="">
              {t("Home.recentUpdates")}
            </Heading>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {datasets?.map((dataset) => (
                <DatasetSimpleCard key={dataset.id} dataset={dataset} />
              ))}
            </div>
            <div className="flex justify-center">
              <Button asChild variant="outline" size="lg" className="w-fit border-2">
                <Link href={"/data"}>{t("Dataset.exploreAll")}</Link>
              </Button>
            </div>
          </div>
        </Container>
      </div>
    </>
  );
}
