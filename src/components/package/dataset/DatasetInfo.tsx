import { Dataset } from "@/schemas/ckan";
//import LinkList from "@/components/ui/link-list";
import ListItem from "@/components/ui/list-item";
import { updateFrequencyValues } from "@/lib/utils";
import Link from "next/link";
import React from "react";
import { getTranslations } from "next-intl/server";
//import { formatDate } from "date-fns";

export default async function DatasetInfo({ dataset }: { dataset: Dataset }) {
  const t = await getTranslations();
  const authorName = dataset.extras?.find(
    (field) => field.key === "contact_point_name"
  )?.value;
  const authorEmail = dataset.extras?.find(
    (field) => field.key === "contact_point_email"
  )?.value;
  const documentation = dataset.extras?.find(
    (field) => field.key === "documentation"
  )?.value;
  const temporalStart = dataset.extras?.find(
    (field) => field.key === "temporal_start"
  )?.value;
  const temporalEnd = dataset.extras?.find(
    (field) => field.key === "temporal_end"
  )?.value;
  const updateFrequency = dataset.extras?.find(
    (field) => field.key === "frequency"
  )?.value;
  const updateFrequencyCode = updateFrequency?.split("/").pop()?.trim();
  const updateFrequencyLabel =
    updateFrequencyCode && updateFrequencyCode in updateFrequencyValues
      ? updateFrequencyValues[
          updateFrequencyCode as keyof typeof updateFrequencyValues
        ]
      : "";

  return (
    <div className="divide-y  ">
      <ListItem title={t("Metadata.author")}>
        {authorEmail ? (
          <Link
            href={`mailto:${authorEmail}`}
            className="underline text-theme-green"
          >
            {authorName}
          </Link>
        ) : (
          authorName
        )}
      </ListItem>
      <ListItem title={t("Metadata.updateFrequency")}>
        {updateFrequencyLabel}
      </ListItem>
      <ListItem title={t("Metadata.documentation")}>
        {documentation|| "--"}
      </ListItem>
      <ListItem title={t("Metadata.temporalCoverageStart")}>
        {temporalStart||"--"}
      </ListItem>
      <ListItem title={t("Metadata.temporalCoverageEnd")}>
        {temporalEnd||"--"}
      </ListItem>
      {/*
      <ListItem title={t("Common.updated")}>
        {formatDate(dataset.metadata_modified ?? "", "dd/MM/yyy, hh:ss")}
      </ListItem>
      <ListItem title={t("Common.created")}>
        {formatDate(dataset.metadata_created ?? "", "dd/MM/yyy, hh:ss")}
      </ListItem>
      <ListItem title={t("Common.groups")}>
        {dataset.groups?.map((g, i) => (
          <React.Fragment key={g.id}>
            <Link className="underline " href={`/search?groups=${g.name}`}>
              {g.display_name}
            </Link>
            {i < (dataset?.groups ?? [])?.length - 1 ? ", " : ""}
          </React.Fragment>
        ))}
      </ListItem>*/}

      
    </div>
  );
}
