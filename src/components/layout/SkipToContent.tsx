"use client";

import { useTranslations } from "next-intl";

export default function SkipToContent() {
  const t = useTranslations();

  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed max-w-fit focus:p-3 top-2 left-2 z-50 bg-theme-green text-white text-sm font-medium shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black block "
      
    >
      {t("Common.skipToContent")}
    </a>
  );
}
