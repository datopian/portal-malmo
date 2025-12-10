import { useResourceDataSafe } from "./DataProvider";
import TableHeadCell from "./TableHeadCell";

export default function TableHead({ className = "" }: { className?: string }) {
  const { columns } = useResourceDataSafe();
  return (
    <thead className={` ${className}`}>
      <tr role="row" className="border-0">
        {columns.map((key, i) => (
          <TableHeadCell key={`th-cell-${i}`} col={key} />
        ))}
      </tr>
    </thead>
  );
}
