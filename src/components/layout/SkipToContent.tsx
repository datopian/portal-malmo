"use client";

import { useTranslations } from "next-intl";

export default function SkipToContent() {
  const t = useTranslations();

  return (
    <a
      href="#main-content"
      className="fixed left-2 top-2 z-50 w-fit -translate-y-24 bg-theme-green px-4 py-2 text-sm font-medium text-white shadow-lg transition-transform duration-150 focus:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
    >
      {t("Common.skipToContent")}
    </a>
  );
}
