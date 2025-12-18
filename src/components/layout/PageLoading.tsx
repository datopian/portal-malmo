import Container from "@/components/ui/container";
import React from "react";
import { Skeleton } from "../ui/skeleton";

export const SearchSkeletonLayout = () => (
  <Container>
    <div className="grid grid-cols-1 gap-x-20 gap-y-10 lg:grid-cols-4 relative mt-6 w-full">
      {/* Filters Sidebar */}
      <div className="hidden lg:block ">
        <div className="space-y-6 w-full">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      </div>
      <div className="lg:col-span-3 space-y-4">
        <Skeleton className="h-6 w-32" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-36 w-full rounded-md bg-gray-100" />
        ))}
      </div>
    </div>
  </Container>
);

export default function PageLoading({
  type = "default",
}: {
  type: "grid" | "list" | "search" | "default";
}) {
  return (
    <div>
      <div className="pt-10 pb-8 bg-[#F6F6EF] border-gray-200 border-t border-b border-dashed flex flex-col justify-center min-h-[226px]">
        <Container>
          <Skeleton className="h-[36px] w-2/6" />
          <div className="space-y-2 mt-3 ">
            <Skeleton className="h-8 w-3/4" />
          </div>
          <div className="space-y-2 mt-3 ">
            <Skeleton className="h-5 w-[120px]" />
          </div>
        </Container>
      </div>

      {type === "default" && (
        <Container>
          <div className="my-10">Loading...</div>
        </Container>
      )}

      {type === "list" && (
        <Container className=" mt-10">
          <Skeleton className="h-8 w-40 mb-8" />
          <div className="space-y-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-16 w-full rounded-md bg-gray-100"
              />
            ))}
          </div>
        </Container>
      )}

      {type === "grid" && (
        <Container className="relative -mt-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="shadow-lg p-5 bg-white rounded-lg border space-y-2"
              >
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </Container>
      )}

      {type === "search" && <SearchSkeletonLayout />}
      <div className="mb-12"></div>
    </div>
  );
}
