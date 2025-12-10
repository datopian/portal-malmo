import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { useSearchState } from "./SearchContext";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export default function SortBy() {
  const { options, setOptions } = useSearchState();
  const t = useTranslations("Search");

  const isActive = (option: string) => {
    return options?.sort === option;
  };

  const sortOptions = [
    { name: t("sortRelevance"), value: "score desc" },
    { name: t("sortLastModified"), value: "metadata_modified desc" },
    { name: t("sortNameAsc"), value: "title asc" },
    { name: t("sortNameDesc"), value: "title desc" }
  ];

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <MenuButton className="group inline-flex justify-center items-center text-black hover:text-gray-900">
          <div className="flex gap-1 items-center">
            <span className="font-medium">{t("sortLabel")}</span>
            <span className="text-sm">
              {sortOptions.find((item) => item.value === options?.sort)?.name ||
                sortOptions[0].name}
            </span>
          </div>
          <ChevronDown
            aria-hidden="true"
            className="-mr-1 ml-1 size-5 shrink-0 "
          />
        </MenuButton>
      </div>

      <MenuItems
        transition
        className="absolute right-0 z-10 mt-2 w-40 origin-top-right rounded-md bg-white shadow-2xl ring-1 ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
      >
        <div className="py-1">
          {sortOptions.map((option) => (
            <MenuItem key={option.value}>
              <button
                type="button"
                onClick={() => setOptions({ sort: option.value, offset: 0 })}
                className={cn(
                  isActive(option.value)
                    ? "font-medium text-gray-900"
                    : "text-gray-500",
                  "block px-4 py-2 text-sm data-focus:bg-gray-100 data-focus:outline-hidden w-full text-left cursor-pointer"
                )}
              >
                {option.name}
              </button>
            </MenuItem>
          ))}
        </div>
      </MenuItems>
    </Menu>
  );
}
