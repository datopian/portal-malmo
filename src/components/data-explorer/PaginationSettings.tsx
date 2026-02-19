type PaginationSettingsProps = {
  pageSize: number;
  onPageSizeChange: (pageSize: number) => void;
  options?: number[];
};

export default function PaginationSettings({
  pageSize,
  onPageSizeChange,
  options = [10, 20, 30, 40, 50, 100],
}: PaginationSettingsProps) {
  return (
    <div className="">
      <div className="">
        <span className=" block font-medium ">
          Pagination
        </span>
      </div>

      <div className="flex justify-between items-center pt-2">
        <span className="text-sm">Rows per page</span>

        <select
          className="p-1 shadow-sm rounded bg-white text-sm"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
        >
          {options.map((v) => (
            <option key={`rows-per-page-${v}`} value={v}>
              {v}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
