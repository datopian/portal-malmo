import { XCircleIcon } from "lucide-react";
import { Tooltip } from "./Tooltip";
import { DataExplorerColumnFilter } from "./DataExplorerInner";

export function ActiveFilters({
  filters,
  setFilters,
}: {
  filters: DataExplorerColumnFilter[];
  setFilters: (filters: DataExplorerColumnFilter[]) => void;
}) {
  const removeFilter = (index: number) => {
    if (index < 0 || index >= filters.length) return;
    setFilters(filters.slice(0, index).concat(filters.slice(index + 1)));
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {filters.map((f, i) => (
          <div
            key={`${f.id}-${i}`}
            className="flex h-8 w-fit items-center gap-x-2 rounded-sm bg-neutral-100 hover:bg-neutral-200 transition px-3 py-1 shadow"
          >
            <div className="font-['Acumin Pro SemiCondensed'] text-xs font-semibold leading-none text-black">
              {f.id}
            </div>
            <Tooltip content="Remove filter">
              <button
                type="button"
                onClick={() => removeFilter(i)}
                aria-label={`Remove filter ${f.id}`}
              >
                <XCircleIcon className="h-4 w-4 text-red-600 cursor-pointer" />
              </button>
            </Tooltip>
          </div>
        ))}
      </div>

      {filters.length ? (
        <button
          type="button"
          onClick={() => setFilters([])}
          className="font-['Acumin Pro SemiCondensed'] text-sm font-normal text-black underline"
        >
          Clear all filters
        </button>
      ) : null}
    </>
  );
}