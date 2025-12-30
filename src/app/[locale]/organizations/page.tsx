import Page from "@/components/layout/Page";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Container from "@/components/ui/container";
import PageSearchInput from "@/components/ui/page-search-input";
import { getAllOrganizations } from "@/lib/ckan/organization";
import { buildLocalizedMetadata } from "@/lib/seo";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export const revalidate = 300;

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function OrganizationsPage({ searchParams }: Props) {
  const t = await getTranslations();
  const organizations = await getAllOrganizations({});
  const { q } = await searchParams;

  const query = Array.isArray(q) ? q[0].toLowerCase() : q?.toLowerCase() || "";

  const filtered = organizations.filter((org) =>
    org.title.toLowerCase().includes(query)
  );

  return (
    <Page
      title={t("Common.organizations")}
      description={t("OrganizationsPage.description")}
      heroClass=""
      heroContent={
        <div className="space-y-3">
          <PageSearchInput
            defaultValue={query}
            placeholder={t("OrganizationsPage.searchPlaceholder")}
          />
          <div>
            {filtered.length > 0 ? (
              <>
                <span className="font-medium">{filtered.length}</span>{" "}
                {filtered.length > 1
                  ? t("Common.organizations")
                  : t("Common.organization")}
              </>
            ) : (
              <span>{t("OrganizationsPage.noOrganizations")}</span>
            )}
          </div>
        </div>
      }
    >
      <Container className="relative -mt-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filtered.map((org) => (
            <Link key={org.id} href={`/@${org.name}`} className="h-full block">
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <div className="line-clamp-2">{org.title}</div>
                </CardHeader>
                <CardContent className="mt-auto text-gray-600">
                  {t("Dataset.datasetsCount", { count: org.package_count })}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </Container>
    </Page>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale});

  return buildLocalizedMetadata({
    locale,
    pathname: "/organizations",
    title: t("Common.organizations"),
    description: t("OrganizationsPage.description"),
  });
}