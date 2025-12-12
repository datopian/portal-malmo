import { PackageFacetOptions } from "@/schemas/ckan";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import FacetOptions from "./FacetOptions";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export default function FacetCard({
  name,
  title,
  items,
  options,
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
  const [seeMore, setSeeMore] = useState(false);
  const maxPerView = 10;
  const t = useTranslations();


  return (
    <Disclosure
      as="div"
      className="border-b border-gray-200  py-6"
    >
      <h3 className="-my-3 mx-4 lg:mx-0 flow-root ">
        <DisclosureButton className="group flex w-full items-center justify-between bg-white py-3  cursor-pointer">
          <span className="font-medium text-theme-green font-semibold">
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
        <div className="space-y-3 mx-4 lg:mx-0">
          {items
            ?.slice(0, seeMore ? items?.length : maxPerView)
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
        {items?.length > maxPerView && (
          <Button
          variant={"outline"}
            onClick={() => setSeeMore(!seeMore)}
            type="button"
            size={"sm"}
            className="mt-4 max-w-fit cursor-pointer"
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
          </Button>
        )}
      </DisclosurePanel>
    </Disclosure>
  );
}
