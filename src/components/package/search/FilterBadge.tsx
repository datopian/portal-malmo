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
    <div className="flex text-xs space-x-1">
      <span className="font-light cursor-help mt-1 " { ...(description?{title:description}:{}) }>
        {label}
      </span>
      <div className="flex items-center gap-1 flex-wrap ">
        {items.map((item, i) => (
          <Badge
            variant={"outline"}
            asChild
            key={`${item}-${i}`}
            onClick={() => onItemClick?.(item)}
            className={` ${cn("flex items-center gap-1 cursor-pointer text-start max-w-[180px] ", badgeClassName)}`}
          >
            <button type="button" >
              <span className="truncate w-full overflow-hidden whitespace-nowrap">{itemTitleRender ? itemTitleRender(item) : item}</span>

              <X className="min-w-[14px]" width={16}/>
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default FilterBadge;
