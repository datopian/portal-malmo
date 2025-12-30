import { useResourceDataSafe } from "./DataProvider";

export default function TableColumnValue({ column, value }:{ column: string; value: unknown }) {
  const { visibleColumns, pinnedColumns } = useResourceDataSafe();
  const isVisible = visibleColumns.includes(column);
  const isPinned = pinnedColumns.includes(column);
  return (
    <td
      className={` px-3 py-4 text-sm text-gray-500   ${
        !isVisible ? "hidden" : ""
      } ${isPinned ? "sticky left-[-1px] bg-gray-50 z-10 font-medium" : ""}`}
      role="gridcell"
      tabIndex={0}
      aria-label={value?.toString()}
    >
      <span className=" block max-w-[400px] w-[max-content] ">{value?.toString()}</span>
      {isPinned && (
        <span className="absolute right-[-1px] h-full w-[1px] bg-gray-50 top-0"></span>
      )}
    </td>
  );
}
