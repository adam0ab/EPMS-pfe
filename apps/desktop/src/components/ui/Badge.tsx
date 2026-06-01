import clsx from "clsx";
import { ProcedureStatus } from "@epms/shared";

const statusClasses: Record<ProcedureStatus, string> = {
  [ProcedureStatus.DRAFT]: "bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300",
  [ProcedureStatus.PUBLISHED]: "bg-green-50 text-success dark:bg-green-500/10",
  [ProcedureStatus.ARCHIVED]: "bg-amber-50 text-warning dark:bg-amber-500/10",
};

export function StatusBadge({ status }: { status: ProcedureStatus }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
        statusClasses[status]
      )}
    >
      {status}
    </span>
  );
}

export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600",
        "dark:bg-slate-700/50 dark:text-slate-300",
        className
      )}
    >
      {children}
    </span>
  );
}
