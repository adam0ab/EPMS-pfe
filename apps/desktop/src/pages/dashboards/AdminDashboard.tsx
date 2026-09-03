import { useNavigate } from "react-router-dom";
import { ProcedureStatus } from "@epms/shared";
import { Card, StatCard } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { DashboardSection } from "../../components/dashboard/DashboardSection";
import { ProcedureCard } from "../../components/dashboard/ProcedureCard";
import { useAdminDashboard } from "../../hooks/useDashboard";
import { useProceduresRequiringAttention, useHealth } from "../../hooks/useDashboard";
import { WorkflowBottlenecks } from "../../components/dashboard/WorkflowBottlenecks";
import { RequiresAttention } from "../../components/dashboard/RequiresAttention";
import { ProcedureHealth } from "../../components/dashboard/ProcedureHealth";
import { DashboardIcon, ProcedureIcon, UsersIcon } from "../../components/layout/icons";

const statusLabel: Record<ProcedureStatus, string> = { draft: "Draft", pending_review: "Pending", approved: "Approved", rejected: "Rejected", published: "Published", archived: "Archived" };

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = useAdminDashboard();
  const { data: attention } = useProceduresRequiringAttention();
  const { data: health } = useHealth();
  const counts = data?.procedureCounts ?? {};

  if (isError) {
    return (
      <div className="space-y-6">
        <header>
          <p className="text-sm font-semibold text-primary">Administration Control Center</p>
          <h1 className="mt-1 text-3xl font-bold text-secondary dark:text-white">EPMS system overview.</h1>
        </header>
        <Card className="border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/30">
          <h2 className="font-semibold text-red-800 dark:text-red-200">Unable to load dashboard statistics</h2>
          <p className="mt-2 text-sm text-red-700 dark:text-red-300">The API or MongoDB connection returned an error. Statistics are not replaced with zero.</p>
          <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error instanceof Error ? error.message : "Unknown dashboard error"}</p>
          <Button className="mt-4" size="sm" variant="ghost" onClick={() => refetch()}>Retry</Button>
        </Card>
      </div>
    );
  }

  const value = (status: ProcedureStatus) => counts[status] ?? (isLoading ? "…" : 0);
  const workflow = [ProcedureStatus.DRAFT, ProcedureStatus.PENDING_REVIEW, ProcedureStatus.APPROVED, ProcedureStatus.PUBLISHED, ProcedureStatus.ARCHIVED];
  const quickActions = [
    { label: "New procedure", to: "/procedures?new=1" },
    { label: "Users", to: "/users" },
    { label: "Departments", to: "/departments" },
    { label: "Categories", to: "/categories" },
    { label: "Reports", to: "/reports" },
  ];

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-semibold text-primary">Administration Control Center</p>
        <h1 className="mt-1 text-3xl font-bold text-secondary dark:text-white">EPMS system overview.</h1>
        <p className="mt-2 text-slate-500">Monitor procedures, workflow activity and institutional resources.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total procedures" value={Object.values(counts).reduce((sum, count) => sum + count, 0) || (isLoading ? "…" : 0)} icon={<ProcedureIcon />} onClick={() => navigate("/procedures")} />
        <StatCard label="Pending review" value={value(ProcedureStatus.PENDING_REVIEW)} accent="warning" icon={<DashboardIcon />} onClick={() => navigate("/procedures?status=pending_review")} />
        <StatCard label="Published" value={value(ProcedureStatus.PUBLISHED)} accent="success" icon={<DashboardIcon />} onClick={() => navigate("/procedures?status=published")} />
        <StatCard label="Archived" value={value(ProcedureStatus.ARCHIVED)} accent="secondary" icon={<DashboardIcon />} onClick={() => navigate("/procedures?status=archived")} />
        <StatCard label="Approved" value={value(ProcedureStatus.APPROVED)} accent="success" icon={<DashboardIcon />} onClick={() => navigate("/procedures?status=approved")} />
        <StatCard label="Rejected" value={value(ProcedureStatus.REJECTED)} accent="danger" icon={<DashboardIcon />} onClick={() => navigate("/procedures?status=rejected")} />
        <StatCard label="Users" value={data?.userCount ?? (isLoading ? "…" : 0)} icon={<UsersIcon />} onClick={() => navigate("/users")} />
        <StatCard label="Documents" value={data?.documentCount ?? (isLoading ? "…" : 0)} icon={<ProcedureIcon />} />
      </div>

      <Card className="p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Lifecycle control</p>
            <h2 className="mt-1 text-lg font-semibold text-secondary dark:text-white">Workflow overview</h2>
          </div>
          <p className="text-xs text-slate-400">Rejected: {value(ProcedureStatus.REJECTED)}</p>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-5">
          {workflow.map((status, index) => (
            <div key={status} onClick={() => navigate(`/procedures?status=${status}`)} className="relative cursor-pointer rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
              <p className="text-xs font-semibold text-slate-500">{statusLabel[status]}</p>
              <p className="mt-1 text-2xl font-bold text-secondary dark:text-white">{value(status)}</p>
              {index < workflow.length - 1 && <span className="absolute -right-3 top-1/2 z-10 hidden h-px w-6 bg-slate-300 md:block dark:bg-slate-600" />}
            </div>
          ))}
        </div>
      </Card>

      <DashboardSection title="Quick actions" description="Open an available administration workspace.">
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action) => (
            <Button key={action.to} size="sm" variant={action.label === "New procedure" ? "primary" : "ghost"} onClick={() => navigate(action.to)}>
              {action.label}
            </Button>
          ))}
        </div>
      </DashboardSection>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <WorkflowBottlenecks counts={counts} />
        </div>

        <div className="space-y-6">
          <RequiresAttention data={attention} />
          <ProcedureHealth data={health} />
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-2">
        <DashboardSection title="Most consulted procedures">
          <div className="grid gap-4 md:grid-cols-2">
            {data?.mostViewed.map((procedure) => (
              <ProcedureCard key={procedure._id} procedure={procedure as never} onClick={() => navigate(`/procedures/${procedure._id}/workflow`)} />
            ))}
          </div>
        </DashboardSection>
        <DashboardSection title="Recent system activity">
          <Card className="divide-y divide-slate-100 p-5 dark:divide-surface-dark-border">
            {data?.recentActivity.map((entry) => (
              <div key={entry._id} className="py-3 first:pt-0 last:pb-0">
                <p className="text-sm font-medium text-secondary dark:text-white">{entry.action.replace(/_/g, " ")} · {entry.entityType}</p>
                <p className="mt-1 text-xs text-slate-500">{entry.actor?.fullName ?? "System"} · {new Date(entry.createdAt).toLocaleString()}</p>
              </div>
            ))}
            {!isLoading && !data?.recentActivity.length && <p className="text-sm text-slate-400">No activity yet.</p>}
          </Card>
        </DashboardSection>
      </div>
    </div>
  );
}
