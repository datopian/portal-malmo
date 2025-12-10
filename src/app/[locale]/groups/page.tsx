import Page from "@/components/layout/Page";
import Container from "@/components/ui/container";
import PageSearchInput from "@/components/ui/page-search-input";
import Link from "next/link";

import { getGroupsFromFacets } from "@/lib/ckan/dataset";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import { buildLocalizedMetadata } from "@/lib/seo";

export const revalidate = 300;

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  return buildLocalizedMetadata({
    locale,
    pathname: "/groups",
    title: t("Common.groups"),
    description: t("GroupsPage.description"),
  });
}

export default async function GroupsPage({ searchParams }: Props) {
  const t = await getTranslations();

  const groups = await getGroupsFromFacets();

  const { q: qParam } = await searchParams;

  const query = Array.isArray(qParam)
    ? qParam[0].toLowerCase()
    : qParam?.toLowerCase() || "";

  const filtered = groups.filter((group) =>
    group.display_name.toLowerCase().includes(query)
  );

  return (
    <Page
      title={t("Common.groups")}
      description={t("GroupsPage.description")}
      heroClass="pb-15"
      heroContent={
        <div className="space-y-3">
          <PageSearchInput
            defaultValue={query}
            placeholder="Search Groups..."
          />
          <div>
            {filtered.length > 0 ? (
              <>
                <span className="font-medium">{filtered.length}</span>{" "}
                {filtered.length > 1 ? t("Common.groups") : t("Common.group")}
              </>
            ) : (
              <span>{t("GroupsPage.noGroups")}</span>
            )}
          </div>
        </div>
      }
    >
      <Container className="-mt-15 relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mt-5">
          {filtered.map((group) => (
            <Link
              href={`/search/?groups=${group.name}`}
              key={group.name}
              className="shadow-lg hover:shadow-xl cursor-pointer p-5 bg-white rounded-lg border space-y-2 transition "
            >
              <div className="font-medium line-clamp-2">
                {group.display_name}
              </div>

              <div className="text-gray-600">
                {t("Dataset.datasetsCount", { count: group.count })}
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </Page>
  );
}
