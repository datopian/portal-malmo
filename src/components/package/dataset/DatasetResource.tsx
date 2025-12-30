import { Resource } from "@/schemas/ckan";
import MarkdownRender from "@/components/ui/markdown";
import { formatFileSize } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import React from "react";
import { RESOURCE_COLORS, supportsPreview } from "@/lib/resource";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EyeIcon } from "lucide-react";

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
      <div className="w-full divide-y">
        {!resources?.length && (
          <p className="text-gray-600 py-3">{t("Dataset.noResources")}</p>
        )}
        {resources?.map((resource) => {
          const formatKey = (format?: string | null) =>
            (format ?? "").trim().toLowerCase();

          const fmt = formatKey(resource.format);
          const hex = RESOURCE_COLORS[fmt] ?? RESOURCE_COLORS.default;
          return (
            <div
              className="flex flex-col py-3  gap-y-3 gap-x-5 py-[30px]"
              key={resource.id}
            >
              <div className="flex flex-col  w-full space-y-2">
                <h4 className="group block ">
                  <span className="block text-xl font-semibold text-theme-green flex items-center gap-2">
                    {resource.name}
                  </span>
                </h4>
                <div className="text-gray-600 flex gap-4 text-sm">
                  <Badge
                    className="font-bold"
                    style={{
                      backgroundColor: hex,
                    }}
                  >
                    {resource.format || "--"}
                  </Badge>
                  {resource.size && (
                    <span>
                      <b className="font-light">{t("Common.size")}:</b>{" "}
                      {formatFileSize(resource.size)}
                    </span>
                  )}
                </div>
                {resource.description && (
                  <div className="line-clamp-2 text-[#4A5565]">
                    <MarkdownRender
                      textOnly={true}
                      content={resource.description}
                    />
                  </div>
                )}
              </div>

              <div className="mt-2 md:mt-0 flex items-center gap-2 ">
                <Button
                  type="button"
                  asChild
                  aria-label={`Download resource ${resource.name}`}
                 
                  variant={"theme"}
                  className="bg-[#666666] px-3 font-medium border-[#666666] border-1 text-white hover:bg-[#666666]/90"
                >
                  <Link
                    href={resource.url ?? ""}
                    target="_blank"
                    download={true}
                  >
                    {t("Common.download")}
                  </Link>
                </Button>
                {supportsPreview(resource) && (
                  <Button
                    type="button"
                    asChild
                    aria-label={`Resource Details: ${resource.name}`}
                   
                    variant={"outline"}
                    className="border-[#666666] px-3 font-medium text-[#666666] hover:bg-[#666666]"
                  >
                    <Link href={`/@${organization}/${dataset}/${resource.id}`}>
                      <EyeIcon size={5} />
                      {t("Common.preview")}
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
