import Container from "@/components/ui/container";
import SearchLayout from "@/components/package/search/SearchLayout";
import { SearchStateProvider } from "@/components/package/search/SearchContext";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import { buildLocalizedMetadata } from "@/lib/seo";
import Hero from "@/components/layout/PageHero";
import SearchForm from "@/components/package/search/SearchForm";

type Props = { params: Promise<{ locale: string }> };

export const revalidate = 300;

export default async function SearchPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return (
    <>
      <Hero title={t("Search.title")} >
        <SearchForm title="" placeholder={t("Search.searchPlaceholder")} />
      </Hero>
      <Container className="relative ">
        <SearchStateProvider>
          <SearchLayout showSearchForm={false} />
        </SearchStateProvider>
      </Container>
    </>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Search" });
  return buildLocalizedMetadata({
    locale,
    pathname: "/data",
    title: t("title"),
    description: t("subtitle"),
  });
}
