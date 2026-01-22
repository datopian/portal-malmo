"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import Container from "../ui/container";
import MarkdownRender from "../ui/markdown";

const STORAGE_KEY = "disclaimerBannerDismissed";

export default function DisclaimerBanner({
  content = "",
}: {
  content: string | null;
}) {
  const [show, setShow] = useState<boolean | null>(null);


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
                className="text-white text-sm/6"
              >
                <MarkdownRender content={content} />
              </div>
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
