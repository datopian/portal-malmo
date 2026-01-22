"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import Container from "../ui/container";
import { Button } from "../ui/button";
import { useTranslations } from "next-intl";
import MarkdownRender from "../ui/markdown";
import { useIsClamped } from "@/hooks/element";

const STORAGE_KEY = "disclaimerBannerDismissed";

export default function DisclaimerBanner({
  content = "",
}: {
  content: string | null;
}) {
  const [show, setShow] = useState<boolean | null>(null);
  const [expanded, setExpanded] = useState(false);
  const { ref, isClamped } = useIsClamped([content, expanded]);
  const t = useTranslations();

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    setShow(!dismissed);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setShow(false);
  };

  if (show === null || !show) return null;

  return (
    content && (
      <div className="bg-gray-900 py-2.5 ">
        <Container>
          <div className="flex items-center gap-x-6 bg-gray-900 ">
            <div className="block">
              <div
                ref={ref}
                className={[
                  "text-white text-sm/6",
                  expanded ? "" : " line-clamp-3  ",
                ].join(" ")}
              >
                <MarkdownRender content={content} />
              </div>

              {!expanded && isClamped && (
                <Button
                  type="button"
                  variant="theme"
                  onClick={() => setExpanded(true)}
                  className="mt-2 font-medium text-theme-green hover:underline underline p-0 cursor-pointer"
                >
                  {t("Common.readMore")}
                </Button>
              )}

              {expanded && (
                <Button
                  type="button"
                  variant="theme"
                  onClick={() => setExpanded(false)}
                  className="mt-2 font-medium text-theme-green hover:underline underline p-0 cursor-pointer"
                >
                  {t("Common.readLess")}
                </Button>
              )}
            </div>

            <div className="flex flex-1 justify-end">
              <button
                type="button"
                className="-m-3 p-3 focus-visible:-outline-offset-4 text-white cursor-pointer"
                onClick={handleDismiss}
              >
                <span className="sr-only">Dismiss</span>
                <X />
              </button>
            </div>
          </div>
        </Container>
      </div>
    )
  );
}
