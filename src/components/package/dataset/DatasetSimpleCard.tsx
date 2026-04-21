"use client";

import { Dataset } from "@/schemas/ckan";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn, formatPrettyDate } from "@/lib/utils";
import MarkdownRender from "@/components/ui/markdown";
import { useLocale } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getLocalizedTextWithLang } from "@/lib/ckan-translations";

const DatasetSimpleCard = ({ dataset }: { dataset: Dataset }) => {
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

  return (
    <Link href={`/@malmo/${dataset.name}`}>
      <Card
        key={dataset.id}
        className={cn("flex flex-col rounded-none h-full p-6", "")}
      >
        <CardHeader className="pb-1 px-0 py-0">
          <h3
            lang={datasetTitle.lang}
            className="line-clamp-3 overflow-hidden text-xl font-bold text-theme-green lg:text-2xl"
          >
            {datasetTitle.text}
          </h3>
        </CardHeader>

        <CardContent className="text-gray-600 px-0 py-3">
          <div className="mb-4 line-clamp-3 overflow-hidden text-gray-700">
            <MarkdownRender content={datasetNotes.text} textOnly lang={datasetNotes.lang} />
          </div>
          <div className="text-sm flex items-center text-gray-500 w-full">
            {formatPrettyDate(dataset.metadata_modified ?? "", locale)}

            <ArrowRight aria-hidden="true" className="size-5 ml-auto " />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default DatasetSimpleCard;
