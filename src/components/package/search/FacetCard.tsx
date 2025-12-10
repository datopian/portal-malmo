import { PackageFacetOptions } from "@/schemas/ckan";
import { useRef, useState } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { Input } from "@/components/ui/input";
import FacetOptions from "./FacetOptions";
import { useTranslations } from "next-intl";

export default function FacetCard({
  name,
  title,
  items,
  options,
  searchPlaceholder = `Common.search`,
  onSelect,
}: {
  name: string;
  title?: React.ReactNode;
  items: PackageFacetOptions[];
  children?: React.ReactNode;
  options?: string[];
  searchPlaceholder?: string;
  onSelect: (v: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [seeMore, setSeeMore] = useState(false);
  const [facetOptionQuery, setFacetOptionQuery] = useState("");
  const maxPerView = 6;
  const t = useTranslations();

  const visibleItems = facetOptionQuery
    ? items.filter((item) =>
        item.display_name
          ?.toLocaleLowerCase()
          ?.includes(facetOptionQuery?.toLowerCase())
      )
    : items;

  return (
    <Disclosure
      as="div"
      className="border-b border-gray-200 border-dashed py-6"
    >
      <h3 className="-my-3 mx-4 lg:mx-0 flow-root ">
        <DisclosureButton className="group flex w-full items-center justify-between bg-white py-3  cursor-pointer">
          <span className="font-medium ">
            {title && <span className="">{title} </span>}
          </span>
          <span className="ml-6 flex items-center">
            <ChevronDown
              aria-hidden="true"
              className="size-5 group-data-open:hidden"
            />
            <ChevronUp
              aria-hidden="true"
              className="size-5 group-not-data-open:hidden"
            />
          </span>
        </DisclosureButton>
      </h3>
      <DisclosurePanel className="pt-3">
        {items.length > maxPerView && (
          <div className="relative mx-4 lg:mx-0 mb-4 ">
            <Input
              ref={inputRef}
              value={facetOptionQuery}
              onChange={(e) => setFacetOptionQuery(e.target.value)}
              placeholder={t(searchPlaceholder)}
              className=""
            />
            {facetOptionQuery && (
              <button
                className="cursor-pointer text-gray-600 hover:text-black transition absolute right-2 top-2  z-10"
                onClick={(e) => {
                  e.preventDefault();
                  setFacetOptionQuery("");
                  inputRef.current?.focus();
                  return false;
                }}
              >
                <X width={16} />
              </button>
            )}
          </div>
        )}

        <div className="space-y-3 mx-4 lg:mx-0">
          {visibleItems
            ?.slice(0, seeMore ? visibleItems?.length : maxPerView)
            .map((item) => (
              <FacetOptions
                name={name}
                value={item.name}
                label={item.display_name || item.name}
                count={item.count}
                key={item.name}
                options={options || []}
                onSelect={onSelect}
              />
            ))}
        </div>
        {visibleItems?.length > maxPerView && (
          <button
            onClick={() => setSeeMore(!seeMore)}
            type="button"
            className="flex items-center gap-1  mt-3 text-sm mx-4 lg:mx-0"
          >
            {seeMore ? (
              <>
                <span className="">{t("Common.showLess")}</span>
                <ChevronUp width={18} />{" "}
              </>
            ) : (
              <>
                <span className="">{t("Common.showMore")}</span>
                <ChevronDown width={18} />
              </>
            )}
          </button>
        )}
      </DisclosurePanel>
    </Disclosure>
  );
}
