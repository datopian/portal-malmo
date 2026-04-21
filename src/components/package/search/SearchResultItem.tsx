import { Dataset } from "@/schemas/ckan";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateToDDMMYYYY } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";
import MarkdownRender from "@/components/ui/markdown";
import { Calendar, Database, RefreshCcw } from "lucide-react";
import { RESOURCE_COLORS } from "@/lib/resource";
import { Link } from "@/i18n/navigation";
import { getLocalizedText, getLocalizedTextWithLang } from "@/lib/ckan-translations";

export default function SearchResultItem({
  dataset,
}: {
  dataset: Dataset;
  query?: string;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const datasetTitle = getLocalizedTextWithLang(
    dataset.title_translated,
    locale,
    dataset.title ?? dataset.name
  );
  const datasetNotes = getLocalizedTextWithLang(
    dataset.notes_translated,
    locale,
    dataset.notes
  );
  const uniqueFormats = [
    ...new Set(
      dataset.resources
        ?.filter((r) => r.format)
        .map((r) => r.format?.toUpperCase())
    ),
  ];

  return (
    <li className="border-b border-gray-200">
      <Link href={`/@malmo/${dataset.name}`} className="flex w-full flex-col gap-4 rounded p-4 sm:flex-row md:p-6">
        <div className="rounded bg-[#D1E0D7] text-theme-green w-fit h-fit p-3">
          <Database aria-hidden="true" className="w-5 sm:w-6" />
        </div>
        <article className="min-w-0">
          <div className="block sm:inline-flex gap-3">
            <h3
              lang={datasetTitle.lang}
              className="text-lg font-semibold block gap-2 w-fit sm:inline"
            >
              <span className="group text-theme-green font-bold text-xl">
                <span className="group-hover:underline">
                  {datasetTitle.text}
                </span>
              </span>
            </h3>
            {dataset.groups?.[0] && (
              <ul className="flex flex-wrap gap-3 sm:ml-3 sm:inline-flex h-fit">
                {dataset.groups?.slice(0, 1)?.map((group) => (
                  <li
                    key={group.id}
                    className="min-w-0 inline-block max-w-[120px] relative -bottom-1 truncate px-2 bg-[#D1E0D7] text-theme-green text-xs py-1 font-medium"
                  >
                    {getLocalizedText(
                      group.title_translated,
                      locale,
                      group.display_name || group.title || group.name
                    )}
                  </li>
                ))}
                {dataset.groups.length > 1 && (
                  <li className="min-w-0 inline-block max-w-[120px] relative -bottom-1 truncate px-2 bg-[#D1E0D7] text-theme-green text-xs py-1 font-medium">
                    +{dataset.groups.length - 1} {t("Common.more")}
                  </li>
                )}
              </ul>
            )}
          </div>

          {datasetNotes.text && (
            <div className="mt-2 overflow-y-hidden font-normal text-gray-700 line-clamp-3">
              <MarkdownRender
                content={datasetNotes.text.replace(/<\/?[^>]+(>|$)/g, "")}
                textOnly
                lang={datasetNotes.lang}
              />
            </div>
          )}
          <dl className="dataset-source my-3 flex flex-col gap-3 text-sm text-[#4A5565] sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            <div className="flex items-center gap-1">
              <dt className="flex items-center gap-1">
                <Calendar aria-hidden="true" size={14} />
                <span>{t("Common.created")}</span>
              </dt>
              <dd>{formatDateToDDMMYYYY(dataset.metadata_created ?? "")}</dd>
            </div>
            <div className="flex items-center gap-1">
              <dt className="flex items-center gap-1">
                <RefreshCcw aria-hidden="true" size={14} />
                <span>{t("Common.updated")}</span>
              </dt>
              <dd>{formatDateToDDMMYYYY(dataset.metadata_modified ?? "")}</dd>
            </div>
            {dataset.tags && dataset.tags.length > 0 && (
              <div className="flex gap-1 items-center">
                <dt className="sr-only">{t("Common.tags")}</dt>
                <dd>
                  <ul className="flex flex-wrap gap-1">
                    {dataset.tags.slice(0, 3).map((tag) => (
                      <li key={tag.id}>#{tag.display_name || tag.name}</li>
                    ))}
                  </ul>
                </dd>
              </div>
            )}
          </dl>
          {dataset.resources.length > 0 && (
            <ul className="flex gap-3 text-sm lowercase text-gray-600">
              {uniqueFormats.slice(0, 5).map((f, i) => (
                <li className="rounded px-2 py-1 text-white" key={i} style={{
                  backgroundColor: RESOURCE_COLORS[f?.toLocaleLowerCase()??""] || RESOURCE_COLORS.default
                }}>
                  {f?.toUpperCase()}
                </li>
              ))}
              {uniqueFormats.length > 5 && (
                <li className="bg-gray-200 px-2 py-1 rounded">
                  +{uniqueFormats.length - 5} {t("Common.more")}
                </li>
              )}
            </ul>
          )}
        </article>
      </Link>
    </li>
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
