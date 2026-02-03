"use client";

import { X } from "lucide-react";
import { useState } from "react";
import Container from "../ui/container";
import MarkdownRender from "../ui/markdown";


export default function DisclaimerBanner({
  content = "",
}: {
  content: string | null;
}) {
  const [show, setShow] = useState<boolean | null>(true);

  const handleDismiss = () => {
    setShow(false);
  };

  if (!show) return null;

  return (
    content && (
      <div className="bg-gray-900 py-2.5 ">
        <Container>
          <div className="flex gap-x-6 bg-gray-900 pr-[48px] relative">
            <div className="block">
              <div
                className="text-white text-sm/6"
              >
                <MarkdownRender content={content} />
              </div>
            </div>

            <div className="flex absolute -top-1 right-0 flex-1 h-fit w-fit  justify-end z-10">
              <button
                type="button"
                className=" p-3 focus-visible:-outline-offset-4 text-white cursor-pointer"
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
