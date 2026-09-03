import clsx from "clsx";
import { ProcedureStatus } from "@epms/shared";

const statusClasses: Record<ProcedureStatus, string> = {
  [ProcedureStatus.DRAFT]: "bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300",
  [ProcedureStatus.PENDING_REVIEW]: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
  [ProcedureStatus.APPROVED]: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  [ProcedureStatus.REJECTED]: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300",
  [ProcedureStatus.PUBLISHED]: "bg-green-50 text-success dark:bg-green-500/10",
  [ProcedureStatus.ARCHIVED]: "bg-amber-50 text-warning dark:bg-amber-500/10",
};

const statusLabels: Record<ProcedureStatus, string> = {
  [ProcedureStatus.DRAFT]: "Brouillon",
  [ProcedureStatus.PENDING_REVIEW]: "En révision",
  [ProcedureStatus.APPROVED]: "Approuvée",
  [ProcedureStatus.REJECTED]: "Rejetée",
  [ProcedureStatus.PUBLISHED]: "Publiée",
  [ProcedureStatus.ARCHIVED]: "Archivée",
};

export function StatusBadge({ status }: { status: ProcedureStatus }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
        statusClasses[status]
      )}
    >
      {statusLabels[status]}
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
