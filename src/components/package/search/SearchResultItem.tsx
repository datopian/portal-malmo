import Link from "next/link";
import { Dataset } from "@/schemas/ckan";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateToDDMMYYYY } from "@/lib/utils";
import { useTranslations } from "next-intl";
import MarkdownRender from "@/components/ui/markdown";
import { Calendar, Database, RefreshCcw } from "lucide-react";
import React from "react";
import { RESOURCE_COLORS } from "@/lib/resource";

export default function SearchResultItem({
  dataset,
}: {
  dataset: Dataset;
  query?: string;
}) {
  const t = useTranslations();
  const uniqueFormats = [
    ...new Set(
      dataset.resources
        ?.filter((r) => r.format)
        .map((r) => r.format?.toUpperCase())
    ),
  ];

  return (
    <Link href={`/@${dataset.organization?.name}/${dataset.name}`} className="space-y-2 w-full rounded flex flex-col sm:flex-row gap-4 w-full border-b border-gray-200  p-4 md:p-6">
      <div className="rounded bg-[#D1E0D7] text-theme-green w-fit h-fit p-3">
        <Database className="w-5 sm:w-6" />
      </div>
      <div>
        <div className="block sm:inline-flex gap-3">
          <h3 className="text-lg font-semibold block gap-2 w-fit block sm:inline">
            <span
              
              className="group text-theme-green font-bold text-xl"
            >
              <span className="group-hover:underline">
                {dataset.title || dataset.name}
              </span>
            </span>
            {dataset.groups?.[0] && (
              <span className="flex space-x-3 sm:inline sm:ml-3">
                {dataset.groups?.slice(0, 1)?.map((group) => (
                  <span
                    key={group.id}
                    className="min-w-0 inline-block max-w-[120px] relative -bottom-1 truncate px-2 bg-[#D1E0D7] text-theme-green text-xs py-1 font-medium"
                  >
                    {group.display_name || group.name}
                  </span>
                ))}
                {dataset.groups.length > 1 && (
                  <span className="min-w-0 inline-block max-w-[120px] relative -bottom-1 truncate px-2 bg-[#D1E0D7] text-theme-green text-xs py-1 font-medium">
                    +{dataset.groups.length - 1} {t("Common.more")}
                  </span>
                )}
              </span>
            )}
          </h3>
        </div>

        {dataset.notes && (
          <div className="text-gray-600 font-normal line-clamp-3 overflow-y-hidden mt-2">
            <MarkdownRender
              content={dataset.notes?.replace(/<\/?[^>]+(>|$)/g, "") || ""}
              textOnly
            />
          </div>
        )}
        <div className="dataset-source  text-sm flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 my-3 text-[#6A7282]">
          <div className="flex gap-1 items-center">
            <span title={t("Common.created")}>
              <Calendar size={14} />
            </span>
            <span>{t("Common.created")}</span>
            {formatDateToDDMMYYYY(dataset.metadata_created ?? "")}
          </div>
          <div className="flex gap-1 items-center">
            <span title={t("Common.updated")}>
              <RefreshCcw size={14} />
            </span>
            <span>{t("Common.updated")}</span>
            {formatDateToDDMMYYYY(dataset.metadata_modified ?? "")}
          </div>
          {dataset.tags && dataset.tags.length > 0 && (
            <div className="flex gap-1 items-center">
              {dataset.tags.slice(0, 3).map((tag) => (
                <React.Fragment key={tag.id}>
                  #{tag.display_name || tag.name}{" "}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
        {dataset.resources.length > 0 && (
          <div className="text-sm lowercase text-gray-600 flex gap-3">
            {uniqueFormats.slice(0, 5).map((f, i) => (
              <span className="px-2 text-white py-1 rounded" key={i} style={{
                backgroundColor: RESOURCE_COLORS[f?.toLocaleLowerCase()??""] || RESOURCE_COLORS.default
              }}>
                {f?.toUpperCase()}
              </span>
            ))}
            {uniqueFormats.length > 5 && (
              <span className="bg-gray-200 px-2 py-1 rounded">
                +{uniqueFormats.length - 5} {t("Common.more")}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

export function SearchResultItemSkeleton() {
  return (
    <div className="space-y-3 w-full rounded">
      <Skeleton className="h-6 w-32" />
      <div className="space-y-1">
        <Skeleton className="h-36 w-full rounded-md bg-gray-100" />
      </div>
    </div>
  );
}
