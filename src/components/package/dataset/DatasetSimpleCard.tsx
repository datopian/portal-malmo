"use client";

import { Dataset } from "@/schemas/ckan";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn, formatPrettyDate } from "@/lib/utils";
import MarkdownRender from "@/components/ui/markdown";
import { useLocale } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";

const DatasetSimpleCard = ({ dataset }: { dataset: Dataset }) => {
  const locale = useLocale();
  return (
    <Link href={`/@malmo/${dataset.name}`}>
      <Card
        key={dataset.id}
        className={cn("flex flex-col rounded-none h-full p-6", "")}
      >
        <CardHeader className="pb-1 px-0 py-0">
          <span className="line-clamp-3 text-xl lg:text-2xl font-bold overflow-hidden text-theme-green">
            {dataset.title}
          </span>
        </CardHeader>

        <CardContent className="text-gray-600 px-0 py-3">
          <div className="line-clamp-3 overflow-hidden mb-4">
            <MarkdownRender content={dataset.notes} textOnly />
          </div>
          <div className="text-sm flex items-center text-gray-500 w-full">
            {formatPrettyDate(dataset.metadata_modified ?? "", locale)}

            <ArrowRight className="size-5 ml-auto " />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default DatasetSimpleCard;
