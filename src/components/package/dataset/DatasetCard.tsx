"use client";

import { Dataset } from "@/schemas/ckan";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn, formatDateToHumanReadable } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { getLocalizedText } from "@/lib/ckan-translations";

export default function DatasetCard({
  dataset,
  linkClassName = "",
  cardClassName = "",
}: {
  dataset: Dataset;
  linkClassName?: string;
  cardClassName?: string;
}) {
  const locale = useLocale();
  const datasetTitle = getLocalizedText(
    dataset.title_translated,
    locale,
    dataset.title ?? dataset.name
  );
  const organizationTitle = getLocalizedText(
    dataset.organization?.title_translated,
    locale,
    dataset.organization?.title ?? dataset.organization?.name
  );

  return (
    <Link
      href={`/@malmo/${dataset.name}`}
      className={linkClassName}
    >
      <Card key={dataset.id} className={cn("flex flex-col", cardClassName)}>
        <CardHeader className="font-medium">
          <span className="line-clamp-2 overflow-hidden">{datasetTitle}</span>
        </CardHeader>
        <CardContent className="mt-auto text-gray-600">
          <div className="text-sm">
            <div className="flex gap-1">
              <span className="">Ã°Å¸Ââ€ºÃ¯Â¸Â</span>{" "}
              <span className="line-clamp-1 overflow-hidden">
                {organizationTitle}
              </span>
            </div>
            <div className="flex gap-1">
              <span className="font-medium">Ã°Å¸â€¢â€™</span>{" "}
              <span className="line-clamp-1 overflow-hidden">
                {formatDateToHumanReadable(dataset.metadata_modified ?? "")}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
