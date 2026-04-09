"use client";

import { Resource } from "@/schemas/ckan";
import MarkdownRender from "@/components/ui/markdown";
import { formatFileSize } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import { RESOURCE_COLORS, supportsPreview } from "@/lib/resource";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EyeIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { getLocalizedTextWithLang } from "@/lib/ckan-translations";

export default function DatasetResources({
  resources,
  dataset,
  organization,
}: {
  resources: Resource[];
  dataset: string;
  organization: string;
}) {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <div className="space-y-5">
      <div className="w-full divide-y">
        {!resources?.length && (
          <p className="text-gray-600 py-3">{t("Dataset.noResources")}</p>
        )}
        <ul>
          {resources?.map((resource) => {
            const resourceName = getLocalizedTextWithLang(
              resource.name_translated,
              locale,
              resource.name
            );
            const resourceDescription = getLocalizedTextWithLang(
              resource.description_translated,
              locale,
              resource.description
            );
            const formatKey = (format?: string | null) =>
              (format ?? "").trim().toLowerCase();

            const fmt = formatKey(resource.format);
            const hex = RESOURCE_COLORS[fmt] ?? RESOURCE_COLORS.default;
            return (
              <li
                className="flex flex-col gap-x-5 gap-y-3 py-[30px]"
                key={resource.id}
              >
                <div className="flex w-full flex-col space-y-2">
                  <h4 className="group block">
                    <span
                      lang={resourceName.lang}
                      className="flex items-center gap-2 text-xl font-semibold text-theme-green"
                    >
                      {resourceName.text}
                    </span>
                  </h4>
                  <div className="flex gap-4 text-sm text-gray-600">
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
                  {resourceDescription.text && (
                    <div className="line-clamp-2 text-[#364153]">
                      <MarkdownRender
                        textOnly={true}
                        content={resourceDescription.text}
                        lang={resourceDescription.lang}
                      />
                    </div>
                  )}
                </div>

                <div className="mt-2 flex items-center gap-2 md:mt-0">
                  <Button
                    type="button"
                    asChild
                    aria-label={`${t("Common.download")} ${resourceName.text}`}
                    variant={"theme"}
                    className="border-1 border-[#666666] bg-[#666666] px-3 font-medium text-white hover:bg-[#666666]/90"
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
                      aria-label={`${t("Common.preview")} ${resourceName.text}`}
                      variant={"outline"}
                      className="border-[#666666] px-3 font-medium text-[#666666] hover:bg-[#666666]"
                    >
                      <Link href={`/@${organization}/${dataset}/${resource.id}`}>
                        <EyeIcon aria-hidden="true" size={5} />
                        {t("Common.preview")}
                      </Link>
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
