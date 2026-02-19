"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useIsClamped } from "@/hooks/element";

interface ExpandableCellProps {
  content: string | number | null | undefined;
  maxLines?: number;
}

export function ExpandableCell({
  content,
}: ExpandableCellProps) {
  const t = useTranslations();

  const [expanded, setExpanded] = useState(false);
  const { ref, isClamped } = useIsClamped([content, expanded]);

  if (content === null || content === undefined) {
    return <span>{content}</span>;
  }

  const contentStr = String(content);

  return (
    <div>
      <div ref={ref} className={`break-all ${!expanded ? "line-clamp-8" : ""}`}>
        {contentStr}
      </div>
      {!expanded && isClamped && (
        <span
          className="text-foreground font-semibold hover:text-text-theme text-sm cursor-pointer hover:underline"
          onClick={() => setExpanded(true)}
        >
          {t("Common.showMore")}
        </span>
      )}

      {expanded&& (
        <span
          className="text-foreground font-semibold hover:text-text-theme text-sm cursor-pointer hover:underline"
          onClick={() => setExpanded(false)}
        >
          {t("Common.showLess")}
        </span>
      )}
    </div>
  );


}
