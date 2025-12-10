import { Dataset } from "@/schemas/ckan";
import LinkList from "@/components/ui/link-list";
import ListItem from "@/components/ui/list-item";
import { formatDateToDDMMYYYY } from "@/lib/utils";
import Link from "next/link";
import React from "react";
import { getTranslations } from "next-intl/server";

export default async function DatasetInfo({ dataset }: { dataset: Dataset }) {
  const t = await getTranslations();

  return (
    <div>
      <ListItem title={t("Common.created")}>
        {formatDateToDDMMYYYY(dataset.metadata_created ?? "")}
      </ListItem>
      <ListItem title={t("Common.updated")}>
        {formatDateToDDMMYYYY(dataset.metadata_modified ?? "")}
      </ListItem>
      <ListItem title={t("Common.organization")}>{dataset.organization?.title}</ListItem>
      <ListItem title={t("Common.groups")}>
        <div>
          {dataset.groups?.map((g, i) => (
            <React.Fragment key={g.id}>
              <Link className="underline " href={`/search?groups=${g.name}`}>
                {g.display_name}
              </Link>
              {i < (dataset?.groups ?? [])?.length - 1 ? ", " : ""}
            </React.Fragment>
          ))}
        </div>
      </ListItem>
      <ListItem title={t("Common.tags")}>
        <div>
          <LinkList
            links={(dataset.tags ?? []).map((tag) => ({
              id: tag.id,
              href: `/search?tags=${tag.name}`,
              title: tag.display_name??"",
            }))}
          />
        </div>
      </ListItem>
      <ListItem title={t("Common.version")}>{dataset.version}</ListItem>
      <ListItem title={t("Common.license")}>{dataset.license_title}</ListItem>
    </div>
  );
}
