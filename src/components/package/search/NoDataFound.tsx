import { useTranslations } from "next-intl";

export default function NoDataFound() {
  const t = useTranslations();
  return (
    <div className="flex flex-col gap-4 text-lg">
      <div className={`flex flex-col  gap-2 `}>
        <span className="text-[#313131]  leading-[23px]">
          {t("Common.noResults")}
        </span>
      </div>
    </div>
  );
}
