import { Dataset, Resource } from "@/schemas/ckan";
import ListItem from "@/components/ui/list-item";
import { formatDateToDDMMYYYY } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export interface ResourceWithDataset extends Resource {
  dataset?: Dataset;
}

export default async function ResourceDetails({
  resource,
}: {
  resource: ResourceWithDataset;
}) {
  const t = await getTranslations("Common");
  const { dataset } = resource;
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
                href={`/@${dataset.organization?.name}/${dataset.name}`}
              >
                {dataset?.title}
              </Link>
            </ListItem>
            <ListItem title={t("organization")}>
              <Link
                href={`/@${dataset.organization?.name}`}
                className="underline"
              >
                {dataset.organization?.title}
              </Link>
            </ListItem>
          </>
        )}
      </div>
    </div>
  );
}
