import React from "react";

export default function ListItem({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[65px] flex-col gap-2 py-2 sm:py-4 md:flex-row md:gap-5">
      <dt className="w-full max-w-[140px] break-words font-semibold text-[#444444]">
        {title}
      </dt>
      <dd className="w-full break-words md:text-end">
        {children}
      </dd>
    </div>
  );
}
