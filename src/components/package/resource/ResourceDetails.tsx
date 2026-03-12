import { Dataset, Resource } from "@/schemas/ckan";
import ListItem from "@/components/ui/list-item";
import { formatDateToDDMMYYYY } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { getLocalizedText } from "@/lib/ckan-translations";

export interface ResourceWithDataset extends Resource {
  dataset?: Dataset;
}

export default async function ResourceDetails({
  resource,
}: {
  resource: ResourceWithDataset;
}) {
  const t = await getTranslations("Common");
  const locale = await getLocale();
  const { dataset } = resource;
  const datasetTitle = dataset
    ? getLocalizedText(dataset.title_translated, locale, dataset.title ?? dataset.name)
    : "";
  const organizationTitle = dataset?.organization
    ? getLocalizedText(
        dataset.organization.title_translated,
        locale,
        dataset.organization.title ?? dataset.organization.name
      )
    : "";
  return (
    <div>
      <div>
        <ListItem title={t("created")}>
          {formatDateToDDMMYYYY(resource.created ?? "")}
        </ListItem>
        <ListItem title={t("updated")}>
          {formatDateToDDMMYYYY(resource.metadata_modified ?? "")}
        </ListItem>
        {dataset && (
          <>
            <ListItem title={t("dataset")}>
              <Link
                className="underline"
                href={`/@malmo/${dataset.name}`}
              >
                {datasetTitle}
              </Link>
            </ListItem>
            <ListItem title={t("organization")}>
              <Link
                href={`/@malmo`}
                className="underline"
              >
                {organizationTitle}
              </Link>
            </ListItem>
          </>
        )}
      </div>
    </div>
  );
}
