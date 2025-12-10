import { envVars } from "@/lib/env";
import { Dataset } from "@/schemas/ckan";
import { Download } from "lucide-react";
import Link from "next/link";
import React from "react";

const DatasetExport = ({
  dataset,
}: {
  dataset: Dataset;
  className?: string;
}) => {
  const DMS = envVars.dms ?? "";
  return (
    <div className="space-y-2">
      <div className=" flex items-center gap-2">
        <span className="font-medium">Export</span>{" "}
        <div className="flex items-center gap-x-4">
          {["rdf", "ttl", "jsonld"].map((type) => (
            <Link
              key={type}
              href={`${DMS}/dataset/${dataset.name}.${type}`}
              target="_blank"
              className="flex items-center gap-1 hover:text-black transition hover:underline"
            >
              <Download width={15} className="" />
              <span className="uppercase">{type}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DatasetExport;
