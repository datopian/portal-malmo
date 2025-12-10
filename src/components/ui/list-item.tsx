import React from "react";

export default function ListItem({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`py-2 sm:py-4 flex flex-col md:flex-row md:gap-4 border-b border-dashed min-h-[65px]`}
    >
      <span className="w-full max-w-[140px] font-medium">{title}</span>
      {children && <div>{children}</div>}
    </div>
  );
}
