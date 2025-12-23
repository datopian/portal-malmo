import Container from "@/components/ui/container";
import Page from "@/components/layout/Page";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import { buildLocalizedMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export const revalidate = 300;

export default async function SearchPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return (
    <Page title={t("Common.aboutUs")} description={""} heroClass="">
      <Container className="relative -mt-6">
       <></>
      </Container>
    </Page>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale});
  return buildLocalizedMetadata({
    locale,
    pathname: "/about-us",
    title: t("Common.aboutUs"),
    description: "",
  });
}
