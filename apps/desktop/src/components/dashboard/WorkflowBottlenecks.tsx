import { useNavigate } from "react-router-dom";
import { ProcedureStatus } from "@epms/shared";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";

const STATUS_CONFIG: Record<ProcedureStatus, { label: string; icon: string; hint: string; accent: "danger" | "warning" | "info" | "success" | "secondary" }> = {
  [ProcedureStatus.DRAFT]: { label: "Draft", icon: "✎", hint: "Not submitted for review", accent: "secondary" },
  [ProcedureStatus.PENDING_REVIEW]: { label: "Pending Review", icon: "⌛", hint: "Waiting for validator", accent: "warning" },
  [ProcedureStatus.APPROVED]: { label: "Approved", icon: "✓", hint: "Ready for publication", accent: "info" },
  [ProcedureStatus.REJECTED]: { label: "Rejected", icon: "!", hint: "Requires correction", accent: "danger" },
  [ProcedureStatus.PUBLISHED]: { label: "Published", icon: "↗", hint: "Active", accent: "success" },
  [ProcedureStatus.ARCHIVED]: { label: "Archived", icon: "▣", hint: "Archived", accent: "secondary" },
};

const accentClasses: Record<string, string> = {
  primary: "bg-primary-50 text-primary dark:bg-primary/10",
  success: "bg-green-50 text-success dark:bg-green-500/10",
  warning: "bg-amber-50 text-warning dark:bg-amber-500/10",
  danger: "bg-red-50 text-danger dark:bg-red-500/10",
  info: "bg-blue-50 text-blue-700 dark:bg-blue-500/10",
  secondary: "bg-slate-100 text-secondary dark:bg-slate-700/40 dark:text-slate-200",
};

export function WorkflowBottlenecks({ counts }: { counts: Record<string, number> }) {
  const navigate = useNavigate();
  const workflow = [
    ProcedureStatus.DRAFT,
    ProcedureStatus.PENDING_REVIEW,
    ProcedureStatus.APPROVED,
    ProcedureStatus.PUBLISHED,
    ProcedureStatus.REJECTED,
    ProcedureStatus.ARCHIVED,
  ];

  return (
    <Card className="p-5">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Workflow</p>
        <h2 className="mt-1 text-lg font-semibold text-secondary dark:text-white">Workflow Bottlenecks</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {workflow.map((status) => {
          const config = STATUS_CONFIG[status];
          const count = counts[status] ?? 0;
          return (
            <button
              key={status}
              onClick={() => navigate(`/procedures?status=${status}`)}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold ${accentClasses[config.accent]}`}>
                    {config.icon}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-secondary dark:text-white">{config.label}</p>
                    <p className="text-xs text-slate-500">{config.hint}</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-secondary dark:text-white">{count}</p>
                <p className="text-xs text-slate-400">procedures</p>
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
