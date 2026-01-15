"use client";

import {useLocale} from "next-intl";
import {useRouter, usePathname} from "@/i18n/navigation";
import {locales} from "@/i18n/config";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  // Single language: no switcher, URLs are unprefixed
  if (locales.length === 1) {
    return null;
  }

  const setLocale = (nextLocale: string) => {
    if (!nextLocale || nextLocale === locale) return;
    router.replace(pathname, {locale: nextLocale});
  };

  return (
    <div className="flex items-center gap-1 text-sm font-medium">
      {locales.map((lang, index) => {
        const code = lang.toLowerCase();
        const isActive = code === locale;

        return (
          <span key={code} className="flex items-center gap-1">
            {index > 0 && <span>|</span>}
            <button
              type="button"
              onClick={() => setLocale(code)}
              className={`transition cursor-pointer ${
                isActive
                  ? "text-theme-green font-semibold"
                  : "text-gray-600 font-light hover:text-theme-green"
              }`}
            >
              {code.toUpperCase()}
            </button>
          </span>
        );
      })}
    </div>
  );
}
