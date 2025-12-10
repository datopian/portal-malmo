import { Resource } from "@/schemas/ckan";
import MarkdownRender from "@/components/ui/markdown";
import { formatFileSize } from "@/lib/utils";
import Link from "next/link";
import React from "react";
import { supportsPreview } from "@/lib/resource";
import { getTranslations } from "next-intl/server";

export default async function DatasetResources({
  resources,
  dataset,
  organization,
}: {
  resources: Resource[];
  dataset: string;
  organization: string;
}) {
  const t = await getTranslations();

  return (
    <div className="space-y-5">
      <div className="w-full overflow-x-auto">
        {!resources?.length && (
          <p className="text-gray-600 py-3">
            {t("Dataset.noResources")}
          </p>
        )}
        {resources?.map((resource) => (
          <div
            className="border-b border-dashed flex flex-col md:flex-row py-3  gap-y-1 gap-x-5"
            key={resource.id}
          >
            
              <div className="flex flex-col space-y-2 w-full">
                <Link
                  href={`/@${organization}/${dataset}/${resource.id}`}
                  className="group block "
                >
                  <span className="block text-lg font-medium group-hover:underline flex items-center gap-2">
                    {resource.name}
                  </span>
                  {resource.description && (
                    <div className="line-clamp-1 text-sm text-gray-700">
                      <MarkdownRender
                        textOnly={true}
                        content={resource.description}
                      />
                    </div>
                  )}
                  <div className="text-gray-600 flex gap-4 text-sm">
                    <span>
                      <b className="font-medium">{t("Common.format")}:</b>{" "}
                      {resource.format || "--"}
                    </span>
                    {resource.size && (
                      <span>
                        <b className="font-light">{t("Common.size")}:</b>{" "}
                        {formatFileSize(resource.size)}
                      </span>
                    )}
                  </div>
                </Link>
              </div>
           

            <div className="sm:ml-auto mt-2 md:mt-0 flex items-center gap-2 -ml-2">
              {supportsPreview(resource) && (
                <Link
                  type="button"
                  href={`/@${organization}/${dataset}/${resource.id}`}
                  className=" text-sm font-medium px-2 flex items-center rounded transition w-fit group"
                  aria-label={`Resource Details: ${resource.name}`}
                >
                  🔍 <span className="group-hover:underline">{t("Common.preview")}</span>
                </Link>
              )}

              <Link
                type="button"
                download={true}
                href={resource.url ?? ""}
                target="_blank"
                className=" text-sm font-medium px-2 flex items-center rounded transition w-fit group"
                aria-label={`Download resource ${resource.name}`}
              >
                ⬇️ <span className="group-hover:underline">{t("Common.download")}</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
