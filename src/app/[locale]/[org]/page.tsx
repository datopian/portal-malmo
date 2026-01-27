import { redirect } from "next/navigation";

type OrgPageParams = {
  locale: string;
  org: string;
};

type OrgPageProps = {
  params: Promise<OrgPageParams>;
};

export default async function OrgPage({ params }: OrgPageProps) {
  const { locale } = await params;

  redirect(`/${locale}/data`);
}
