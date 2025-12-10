import { RowData, useResourceDataSafe } from "./DataProvider";
import TableColumnValue from "./TableColValue";
import TableHead from "./TableHead";

export default function TableData() {
  const { paginatedData, columns } = useResourceDataSafe();
  return (
    <div className="overflow-auto max-h-[750px] relative border-y min-h-[500px] w-full">
      <table
        className="min-w-full table-auto border-collapse border-0 static"
        role="table"
      >
        <TableHead className="sticky top-0 z-[15] border-b bg-white shadow-sm" />
        <tbody className="divide-y divide-accent-100">
          {paginatedData?.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-3 py-4 text-sm text-gray-500 text-center">
                No results found.
              </td>
            </tr>
          )}
          {paginatedData.map((row:RowData, rowIndex) => (
            <tr key={rowIndex} role="row">
              {columns.map((key, z) => (
                <TableColumnValue
                  key={`col-${z}`}
                  column={key}
                  value={row[key] as string }
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
