"use client";

import { Activity } from "@/schemas/ckan";
import { CalendarClock, User as UserIcon } from "lucide-react";
import { formatDateToHumanReadable } from "@/lib/utils";
import { Skeleton } from "../ui/skeleton";

type ActivityItemProps = {
  activity: Activity;
};

export default function ActivityItem({ activity }: ActivityItemProps) {
  const { timestamp, activity_type, user_data, data } = activity;

  const userDisplay = user_data
    ? user_data.fullname || user_data.name
    : "Unknown User";

  const datasetTitle = data?.package?.title;

  const activityLabels = {
    "new package": "✨ Created dataset",
    "changed package": "🔄 Updated dataset",
    "deleted package": "❌ Deleted dataset",
    "new organization": "✨ Created organization",
    "changed organization": "🔄 Updated organization",
  };

  const getActivityLabel = (type: string | undefined) => {
    if (!type) return "🔍 Unknown activity";
    return (
      activityLabels[type as keyof typeof activityLabels] ||
      `${type.replace(/_/g, " ")}`
    );
  };

  return (
    <div className="border-gray-200 flex flex-col sm:flex-row gap-2 w-full border-dashed py-4 sm:py-6 border-b transition-all">
      <div className="flex-grow">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="text-gray-600 flex flex-col sm:flex-row sm:items-center gap-2">
            {user_data ? (
              <>
                <div className="flex gap-2">
                  <UserIcon size={16} className="text-gray-400 min-w-[16px]" />
                  <span className="font-medium text-black">{userDisplay}</span>
                </div>

                <span className="capitalize pl-6 sm:pl-0 text-black ">
                  {getActivityLabel(activity_type)}
                </span>
              </>
            ) : (
              <span className="capitalize pl-6 sm:pl-0 text-black ">
                {getActivityLabel(activity_type)}
              </span>
            )}
          </div>
        </div>

        {datasetTitle && (
          <div className="mt-1 flex items-center text-gray-600 gap-2">
            <div className="leading-snug ml-6 pl-0.5">
              <span className="font-light text-black">{datasetTitle}</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-500">
        <CalendarClock size={16} className="min-w-[16px]" />
        <span>
          {formatDateToHumanReadable(timestamp)}
        </span>
      </div>
    </div>
  );
}


export function ActivityItemSkeleton() {
  return (
    <div className="border-gray-200 flex flex-col sm:flex-row gap-2 w-full border-dashed py-4 sm:py-6 border-b">
      <div className="flex-grow">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="text-gray-600 flex flex-col sm:flex-row sm:items-center gap-2">
            <Skeleton className="h-4 w-20 " />
          </div>
        </div>
        <div className="mt-1 flex items-center text-gray-600 gap-2">
          <div className="leading-snug pl-0.5">
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}