import { MouseEventHandler } from "react";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const FilterBadge = ({
  label,
  description,
  items,
  badgeClassName,
  itemTitleRender,
  onItemClick,
}: // onClick,
{
  label: string;
  description?:string;
  items: string[];
  badgeClassName?:string;
  itemTitleRender?: (item: string) => string | undefined;
  onItemClick?: (item: string) => void;
  onClick?: MouseEventHandler<HTMLSpanElement>;
}) => {
  return (
    <div className="flex text-sm space-x-1">
      <span className=" " { ...(description?{title:description}:{}) }>
        {label}
      </span>
      <ul className="flex flex-wrap items-center gap-1">
        {items.map((item, i) => (
          <li key={`${item}-${i}`}>
            <Badge
              variant={"outline"}
              asChild
              onClick={() => onItemClick?.(item)}
              className={` ${cn("flex max-w-[180px] cursor-pointer items-center gap-1 text-start ", badgeClassName)}`}
            >
              <button type="button">
                <span className="w-full truncate overflow-hidden whitespace-nowrap">{itemTitleRender ? itemTitleRender(item) : item}</span>
                <X aria-hidden="true" className="min-w-[14px]" width={16}/>
              </button>
            </Badge>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FilterBadge;
