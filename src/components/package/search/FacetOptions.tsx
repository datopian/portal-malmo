"use client";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { useCallback } from "react";

type FacetOptionsProps = {
  name: string;
  value: string;
  label: string;
  count?: number;
  options: string[];
  onSelect: (v: string[]) => void;
};

export const FacetOptions = ({
  name,
  value,
  label,
  count,
  options,
  onSelect,
}: FacetOptionsProps) => {


  const isActive = options.includes(value);

  const toggleSelection = useCallback(() => {

    const updatedValues = isActive
      ? options.filter((v) => v !== value)
      : [...options, value];

    onSelect(updatedValues);

  }, [isActive, options, onSelect, value]);

  return (
    <div className="flex">
      <input
        type="checkbox"
        id={`${name}-${value}`}
        checked={isActive}
        onChange={toggleSelection}
        className="hidden"
      />
      <label
        htmlFor={`${name}-${value}`}
        tabIndex={0}
        onKeyDown={(e) =>
          (e.key === " " || e.key === "Enter") && toggleSelection()
        }
        className={cn(
          "mt-1 h-4 max-w-4 min-w-4 flex items-center justify-center rounded border-2 cursor-pointer transition-colors",
           isActive ? "bg-foreground border-foreground" : "bg-white border-gray-200"
         )}
      >
        {isActive && <Check className="text-white" />}
        <span className="sr-only">{label}</span>
      </label>
      <span
        onClick={toggleSelection}
        className="ml-3 text-gray-600 cursor-pointer"
      >
        {label} {count !== undefined && `(${count})`}
      </span>
    </div>
  );
};

export default FacetOptions;
