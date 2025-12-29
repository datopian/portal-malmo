import { Dataset } from "@/schemas/ckan";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn, formatDateToHumanReadable } from "@/lib/utils";
import { Link } from "@/i18n/navigation";

export default function DatasetCard({
  dataset,
  linkClassName = "",
  cardClassName = "",
}: {
  dataset: Dataset;
  linkClassName?: string;
  cardClassName?: string;
}) {
  return (
    <Link
      href={`/@${dataset.organization?.name}/${dataset.name}`}
      className={linkClassName}
    >
      <Card key={dataset.id} className={cn("flex flex-col", cardClassName)}>
        <CardHeader className="font-medium">
          <span className="line-clamp-2 overflow-hidden">{dataset.title}</span>
        </CardHeader>
        <CardContent className="mt-auto text-gray-600">
          <div className="text-sm">
            <div className="flex gap-1">
              <span className="">🏛️</span>{" "}
              <span className="line-clamp-1 overflow-hidden">
                {dataset.organization?.title}
              </span>
            </div>
            <div className="flex gap-1">
              <span className="font-medium">🕒</span>{" "}
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
