import Link from "next/link";
import { Dataset } from "@/schemas/ckan";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateToDDMMYYYY } from "@/lib/utils";
import { useTranslations } from "next-intl";

export default function SearchResultItem({ dataset,query }: { dataset: Dataset;query?:string; }) {
  const t = useTranslations();
  const uniqueFormats = [
    ...new Set(
      dataset.resources
        ?.filter((r) => r.format)
        .map((r) => r.format?.toUpperCase())
    ),
  ];

  const highlightText = (text: string = "", query: string = "") => {
    if (!query.trim()) return text;
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escapedQuery})`, "gi");
    return text.split(regex).map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-200">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="space-y-2 w-full rounded  w-full border-b border-gray-200 border-dashed pb-4">
      <div>
        <h3 className="text-lg font-semibold">
          <Link
            href={`/@${dataset.organization?.name}/${dataset.name}`}
            className="underline decoration-foreground hover:text-foreground"
          >
            {highlightText(dataset.title || dataset.name, query)}
          </Link>
        </h3>

        <div className="dataset-source text-gray-700 text-sm flex flex-col sm:flex-row sm:items-center sm:gap-4 my-2">
          <div>
            <span title={t("Common.organization")}>🏛️ </span>
            <Link
              className="hover:underline"
              href={`/@${dataset.organization?.name}`}
            >
              {
                highlightText(
                  dataset.organization?.title || "",
                  query
                )
              }
            
            </Link>
          </div>
          <div>
            <span title={t("Common.updated")}>🕒 </span>
            {formatDateToDDMMYYYY(dataset.metadata_modified ?? "")}
          </div>

          {dataset.resources.length > 0 && (
            <div className="text-sm lowercase text-gray-600">
              <span>
                <span title={t("Common.format")}>📦</span> {dataset.resources.length}{" "}
                file{dataset.resources.length > 1 ? "s" : ""}
                {uniqueFormats.length > 0 &&
                  `(${
                    uniqueFormats.length <= 3
                      ? uniqueFormats.join(", ")
                      : `${uniqueFormats.slice(0, 3).join(", ")}...`
                  })`}
              </span>
            </div>
          )}
        </div>
      </div>

      {dataset.notes && (
        <p className="text-gray-600 font-normal line-clamp-2 mt-2 overflow-y-hidden">
          {highlightText(
            dataset.notes?.replace(/<\/?[^>]+(>|$)/g, "") || "",
            query
          )}
        </p>
      )}
    </div>
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
