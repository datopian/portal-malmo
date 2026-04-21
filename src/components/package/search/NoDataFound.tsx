import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export default function NoDataFound() {
  const t = useTranslations();
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-gray-50 p-5 text-lg">
      <div className={`flex flex-col gap-2`}>
        <span className="leading-[23px] text-[#313131]">
          {t("Common.noResults")}
        </span>
        <p className="text-base text-gray-700">{t("Search.noResultsHelp")}</p>
        <Link href="/data" className="w-fit text-base font-medium text-theme-green underline">
          {t("Search.browseAllDatasets")}
        </Link>
      </div>
    </div>
  );
}
