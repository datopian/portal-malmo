import { Dataset } from "@/schemas/ckan";
import ListItem from "@/components/ui/list-item";
import { updateFrequencyValues } from "@/lib/utils";
import React from "react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { format, isValid, parseISO } from "date-fns";

export default async function DatasetInfo({ dataset }: { dataset: Dataset }) {

  const t = await getTranslations();
  const landingPage = dataset.extras?.find(
    (field) => field.key.toLowerCase() === "landing_page",
  )?.value;
  const authorName = dataset.extras?.find(
    (field) => field.key.toLowerCase() === "contact_point_name",
  )?.value;
  const authorEmail = dataset.extras?.find(
    (field) => field.key.toLowerCase() === "contact_point_email",
  )?.value;
  const issued = dataset.extras?.find(
    (field) => field.key.toLowerCase() === "issued",
  )?.value;
  const updateFrequency = dataset.extras?.find(
    (field) => field.key.toLowerCase() === "frequency",
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
      <ListItem title={t("Common.organization")}>
        {dataset.organization.title}
      </ListItem>
      <ListItem title={t("Metadata.updateFrequency")}>
        {updateFrequencyLabel || "--"}
      </ListItem>
      <ListItem title={t("Common.license")}>
        {dataset.license_title || "--"}
      </ListItem>
      <ListItem title={t("Metadata.landingPage")}>
        {landingPage ? (
         <Link
            className="underline text-theme-green hover:text-theme-green-900 flex items-center justify-end gap-2"
            href={landingPage}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("Common.visit")} <ExternalLink size={16}/>
          </Link>
        ) : (
          "--"
        )}
      </ListItem>
      <ListItem title={t("Metadata.contactPoint")}>
        {authorEmail ? (
          <a
            href={`mailto:${authorEmail}`}
            className="underline text-theme-green"
          >
            {authorName || authorEmail}
          </a>
        ) : (
          authorName || "--"
        )}
      </ListItem>
      <ListItem title={t("Metadata.issued")}>
        {issued && isValid(parseISO(issued))
          ? format(parseISO(issued), "dd/MM/yyyy")
          : "--"}
      </ListItem>
 
    </div>
  );
}
