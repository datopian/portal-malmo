import { TriangleAlert } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function StagingWarning() {
  const t = await getTranslations("StagingWarning");

  return (
    <aside
      aria-label={t("title")}
      className="fixed bottom-3 left-3 z-30 flex w-[calc(100%-1.5rem)] max-w-72 gap-3 rounded-md border border-gray-200 border-l-4 border-l-amber-700 bg-white px-3 py-2.5 text-gray-700 shadow-lg sm:bottom-5 sm:left-5"
    >
      <TriangleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-amber-700" />
      <div className="text-sm leading-5">
        <strong className="block font-bold uppercase tracking-wide text-theme-green">{t("title")}</strong>
        <span>{t("description")}</span>
      </div>
    </aside>
  );
}
