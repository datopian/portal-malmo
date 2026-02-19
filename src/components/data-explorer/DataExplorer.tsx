"use client";
import { Resource } from "@/schemas/ckan";
import DataExplorerInner from "./DataExplorerInner";
import { useFields } from "./queryHooks";
import Container from "../ui/container";

import { TableSkeleton } from "./TableSkeleton";
import Spinner from "./Spinner";

export function DataExplorer({ resource }: { resource: Resource }) {
  const { data: tableData } = useFields(resource.id);
  if (!tableData)
    return (
      <Container className="text-right relative">
        <div className={"relative top-5 right-0 z-10"} >
          <Spinner />
          <TableSkeleton />
        </div>
      </Container>
    );
  return (
    <DataExplorerInner
      key={resource.id}
      resource={resource}
      columns={tableData.columns}
    />
  );
}
