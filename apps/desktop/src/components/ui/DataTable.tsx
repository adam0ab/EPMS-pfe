import { ReactNode } from "react";

export interface DataTableColumn<T> {
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  isLoading,
  emptyMessage = "No records found.",
  onRowClick,
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200/70 dark:border-surface-dark-border">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
          <tr>
            {columns.map((col) => (
              <th key={col.header} className="px-4 py-3 font-semibold">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-surface-dark-border">
          {isLoading && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-400">
                Loading…
              </td>
            </tr>
          )}
          {!isLoading && rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-400">
                {emptyMessage}
              </td>
            </tr>
          )}
          {!isLoading &&
            rows.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={() => onRowClick?.(row)}
                className={
                  onRowClick
                    ? "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    : undefined
                }
              >
                {columns.map((col) => (
                  <td key={col.header} className={`px-4 py-3 text-secondary dark:text-slate-200 ${col.className ?? ""}`}>
                    {col.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
