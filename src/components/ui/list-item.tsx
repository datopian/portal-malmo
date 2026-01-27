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
      className={`py-2 sm:py-4 flex flex-col md:flex-row md:gap-4  min-h-[65px]`}
    >
      <span className="w-full max-w-[140px] font-semibold text-[#444444]">{title}</span>
      {children && <div className="md:text-end w-full break-all">{children}</div>}
    </div>
  );
}
