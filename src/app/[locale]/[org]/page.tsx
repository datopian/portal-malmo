import { SearchStateProvider } from "@/components/package/search/SearchContext";
import { notFound } from "next/navigation";
import SearchLayout from "@/components/package/search/SearchLayout";
import Page from "@/components/layout/Page";
import { formatDateToDDMMYYYY } from "@/lib/utils";
import ListItem from "@/components/ui/list-item";
import { getOrganization } from "@/lib/ckan/organization";
import ActivityStream from "@/components/activity/ActivityStream";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import { buildLocalizedMetadata } from "@/lib/seo";

type OrgPageParams = {
  locale: string;
  org: string;
};

type OrgPageProps = {
  params: Promise<OrgPageParams>;
};

export const revalidate = 300;

export async function generateStaticParams(): Promise<Array<{ org: string }>> {
  return [];
}

export default async function OrgPage({ params }: OrgPageProps) {
  const { locale, org } = await params;
  const t = await getTranslations({ locale });
  let orgName = decodeURIComponent(org);

  if(!orgName.includes("@")) {
    return notFound();
  }

  orgName = orgName.split("@")[1];

  if (!orgName) {
    return notFound();
  }
  const organization = await getOrganization({
    name: orgName as string,
    include_datasets: true,
  });

  if (!organization) {
    return notFound();
  }

  return (
    <Page
      breadcrumb={{
        items: [
          {
            title: t("Common.organizations"),
            href: "/organizations",
          },
        ],
      }}
      title={organization.title}
      description={organization.description}
      tabs={[
        {
          title: t("Common.datasets"),
          id: "datasets",
          content: (
            <SearchStateProvider defaultOrg={organization.id}>
              <SearchLayout />
            </SearchStateProvider>
          ),
        },
        {
          title: t("Common.metadata"),
          id: "metadata",
          content: (
            <div>
              <ListItem title={t("Common.created")}>
                {formatDateToDDMMYYYY(organization.created ?? "")}
              </ListItem>
              <ListItem title={t("Dataset.total")}>
                {organization.package_count ?? 0}
              </ListItem>
            </div>
          ),
        },
        {
          title: t("Common.activityStream"),
          id: "activity",
          content: (
            <div>
              <ActivityStream type="organization" id={organization.name} />
            </div>
          ),
        },
      ]}
    />
  );
}


export async function generateMetadata({
  params,
}: OrgPageProps): Promise<Metadata> {

  const { locale, org } = await params;
  let orgName = decodeURIComponent(org);

  orgName = orgName.includes("@") ? orgName.split("@")[1] : org;

  const orgData = await getOrganization({
    name: orgName as string,
    include_datasets: false,
  });

  const title = orgData?.title ?? orgName
  const description = orgData?.description ?? "";

  return buildLocalizedMetadata({
    locale,
    pathname: `/${orgName}`, 
    title,
    description,
  });
}