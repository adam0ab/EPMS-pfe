import { useNavigate } from "react-router-dom";
import { ProcedureStatus } from "@epms/shared";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { ProceduresRequiringAttention } from "../../api/dashboard.api";

function timeAgo(dateString?: string) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days > 0) return `Waiting for ${days} day${days > 1 ? "s" : ""}`;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours > 0) return `Waiting for ${hours} hour${hours > 1 ? "s" : ""}`;
  const minutes = Math.floor(diff / (1000 * 60));
  return `Waiting for ${minutes} minute${minutes > 1 ? "s" : ""}`;
}

export function RequiresAttention({ data }: { data: ProceduresRequiringAttention | undefined }) {
  const navigate = useNavigate();

  if (!data) return null;

  const categories = [
    { key: "overdue", label: "Overdue", icon: "🔴", status: ProcedureStatus.DRAFT, navigateTo: `/procedures?health=overdue` },
    { key: "pendingReview", label: "Pending Review", icon: "🟠", status: ProcedureStatus.PENDING_REVIEW, navigateTo: `/procedures?status=${ProcedureStatus.PENDING_REVIEW}` },
    { key: "rejected", label: "Rejected", icon: "🟡", status: ProcedureStatus.REJECTED, navigateTo: `/procedures?status=${ProcedureStatus.REJECTED}` },
    { key: "readyToPublish", label: "Ready to Publish", icon: "🔵", status: ProcedureStatus.APPROVED, navigateTo: `/procedures?status=${ProcedureStatus.APPROVED}` },
    { key: "upcomingDeadline", label: "Upcoming Deadline", icon: "🟣", status: undefined as ProcedureStatus | undefined, navigateTo: "/procedures?health=upcoming-deadline" },
  ] as const;

  return (
    <Card className="p-0">
      <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-5 py-4 dark:border-slate-800 dark:from-slate-900 dark:to-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Action Center</p>
            <h2 className="mt-1 text-lg font-semibold text-secondary dark:text-white">Requires Attention</h2>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{data.total}</span>
        </div>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {categories.map((category) => {
          const items = data.categories[category.key];
          if (!items || items.length === 0) return null;
          return (
            <div key={category.key} className="px-5 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{category.icon}</span>
                  <p className="text-sm font-semibold text-secondary dark:text-white">{category.label}</p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => navigate(category.navigateTo)}>
                  View ({items.length})
                </Button>
              </div>
              <div className="mt-3 space-y-2">
                {items.slice(0, 3).map((procedure) => (
                  <div key={procedure._id} className="flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-secondary dark:text-white">{procedure.title}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {typeof procedure.department === "object" ? procedure.department.name : "—"}
                        {procedure.deadline ? ` · Deadline: ${new Date(procedure.deadline).toLocaleDateString()}` : ""}
                      </p>
                      {category.status === ProcedureStatus.PENDING_REVIEW && (
                        <p className="mt-0.5 text-xs text-slate-400">{timeAgo(procedure.submittedAt)}</p>
                      )}
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => navigate(`/procedures/${procedure._id}/workflow`)}>
                      Open
                    </Button>
                  </div>
                ))}
                {items.length > 3 && (
                  <p className="text-xs text-slate-400">+{items.length - 3} more</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
