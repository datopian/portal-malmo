import Page from "@/components/layout/Page";
import Container from "@/components/ui/container";
import PageSearchInput from "@/components/ui/page-search-input";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import { buildLocalizedMetadata } from "@/lib/seo";
import { ckan } from "@/lib/ckan";
import GroupCard from "@/components/groups/GroupCard";
import { GROUP_CARD_COLORS } from "@/lib/groups";

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

  const groups = await ckan().getGroupsWithDetails();

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
      heroContent={
        <div className="space-y-3">
          <PageSearchInput
            defaultValue={query}
            placeholder="Search Themes..."
          />
        </div>
      }
    >
      <Container className="relative">
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 py-12">

            {filtered.length > 0 ? filtered.map((group, i) => (
              <GroupCard
                key={group.id}
                group={group}
                colorClass={GROUP_CARD_COLORS[i] || "bg-gray-600"}
              />
            )): (
              <span className="text-sm">
                {t("GroupsPage.noGroups")}
              </span>
            )}
          
        </div>
      </Container>
    </Page>
  );
}
