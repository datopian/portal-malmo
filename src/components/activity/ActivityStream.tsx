"use client";

import { useFetch } from "@/hooks/fetch";
import ActivityItem, { ActivityItemSkeleton } from "./ActivityItem";
import { Activity, CKANResponse } from "@/schemas/ckan";
import { useTranslations } from "next-intl";
import { envVars } from "@/lib/env";

const ActivityStream = ({
  type,
  id,
}: {
  type: "organization" | "group" | "package";
  id: string;
}) => {
  const t = useTranslations("Activity");
  const DMS = envVars.dms ?? "";
  const { data, isLoading, error } = useFetch<CKANResponse<Activity[]>>(
    `${DMS}/api/3/action/${type}_activity_list?id=${id}`,
    "json"
  );
  return (
    <div>
      {isLoading && (
        <>
          {[...Array(4)].map((_, i) => (
            <ActivityItemSkeleton key={i} />
          ))}
        </>
      )}
      {error && (
        <div>{t("error", { type, message: error.message })}</div>
      )}
      {data?.result?.length && data?.result?.length > 0
        ? data?.result?.map((a) => <ActivityItem key={a.id} activity={a} />)
        : !isLoading && !error && <div className="text-sm">{t("notFound")}</div>}
    </div>
  );
};

export default ActivityStream;
