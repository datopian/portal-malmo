import Container from "@/components/ui/container";
import SearchLayout from "@/components/package/search/SearchLayout";
import { SearchStateProvider } from "@/components/package/search/SearchContext";
import Page from "@/components/layout/Page";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import { buildLocalizedMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export const revalidate = 300;

export default async function SearchPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Search" });
  return (
    <Page title={t("title")} description={t("subtitle")} heroClass="">
      <Container className="relative -mt-6">
        <SearchStateProvider>
          <SearchLayout />
        </SearchStateProvider>
      </Container>
    </Page>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Search" });
  return buildLocalizedMetadata({
    locale,
    pathname: "/search",
    title: t("title"),
    description: t("subtitle"),
  });
}
