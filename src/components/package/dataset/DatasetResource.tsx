import { Resource } from "@/schemas/ckan";
import MarkdownRender from "@/components/ui/markdown";
import { formatFileSize } from "@/lib/utils";
import Link from "next/link";
import React from "react";
import { supportsPreview } from "@/lib/resource";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
      <div className="w-full ">
        {!resources?.length && (
          <p className="text-gray-600 py-3">{t("Dataset.noResources")}</p>
        )}
        {resources?.map((resource) => (
          <div
            className="flex flex-col py-3  gap-y-1 gap-x-5"
            key={resource.id}
          >
            <div className="flex flex-col  w-full">
              <Link
                href={`/@${organization}/${dataset}/${resource.id}`}
                className="group block space-y-2"
              >
                <span className="block text-xl font-semibold text-theme-green group-hover:underline flex items-center gap-2">
                  {resource.name}
                </span>

                <div className="text-gray-600 flex gap-4 text-sm">
                  <Badge variant="themeGreen">{resource.format || "--"}</Badge>
                  {resource.size && (
                    <span>
                      <b className="font-light">{t("Common.size")}:</b>{" "}
                      {formatFileSize(resource.size)}
                    </span>
                  )}
                </div>
                {resource.description && (
                  <div className="line-clamp-1 text-[#4A5565]">
                    <MarkdownRender
                      textOnly={true}
                      content={resource.description}
                    />
                  </div>
                )}
              </Link>
            </div>

            <div className="mt-2 md:mt-0 flex items-center gap-2 -ml-2">
              {supportsPreview(resource) && (
                <Button
                  type="button"
                  asChild
                  aria-label={`Resource Details: ${resource.name}`}
                  variant="outline"
                >
                  <Link href={`/@${organization}/${dataset}/${resource.id}`}>
                    {t("Common.preview")}
                  </Link>
                </Button>
              )}

              <Link
                type="button"
                download={true}
                href={resource.url ?? ""}
                target="_blank"
                className=" text-sm font-medium px-2 flex items-center rounded transition w-fit group"
                aria-label={`Download resource ${resource.name}`}
              >
                ⬇️{" "}
                <span className="group-hover:underline">
                  {t("Common.download")}
                </span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
