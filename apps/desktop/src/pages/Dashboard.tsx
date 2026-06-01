import { useDashboardStats } from "../hooks/useDashboard";
import { Card, StatCard } from "../components/ui/Card";
import { HorizontalBarChart } from "../components/charts/HorizontalBarChart";
import { StatusPieChart } from "../components/charts/StatusPieChart";
import { StatusBadge } from "../components/ui/Badge";
import { ProcedureStatus } from "@epms/shared";
import { DashboardIcon, ProcedureIcon } from "../components/layout/icons";

export default function Dashboard() {
  const { data, isLoading } = useDashboardStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary dark:text-white">Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Overview of institutional procedures across ESPRIT.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Procedures" value={data?.totalProcedures ?? (isLoading ? "…" : 0)} icon={<ProcedureIcon />} accent="primary" />
        <StatCard label="Published" value={data?.publishedProcedures ?? (isLoading ? "…" : 0)} icon={<DashboardIcon />} accent="success" />
        <StatCard label="Drafts" value={data?.draftProcedures ?? (isLoading ? "…" : 0)} icon={<DashboardIcon />} accent="secondary" />
        <StatCard label="Archived" value={data?.archivedProcedures ?? (isLoading ? "…" : 0)} icon={<DashboardIcon />} accent="warning" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold text-secondary dark:text-white">
            Procedures by Department
          </h2>
          <HorizontalBarChart
            items={(data?.proceduresByDepartment ?? []).map((d) => ({ label: d.department, value: d.count }))}
          />
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 text-sm font-semibold text-secondary dark:text-white">Status Distribution</h2>
          <StatusPieChart
            data={[
              { label: "Published", value: data?.publishedProcedures ?? 0, color: "#22C55E" },
              { label: "Draft", value: data?.draftProcedures ?? 0, color: "#94a3b8" },
              { label: "Archived", value: data?.archivedProcedures ?? 0, color: "#F59E0B" },
            ]}
          />
        </Card>

        <Card className="p-5 lg:col-span-3">
          <h2 className="mb-4 text-sm font-semibold text-secondary dark:text-white">
            Procedures by Category
          </h2>
          <HorizontalBarChart
            color="#1E293B"
            items={(data?.proceduresByCategory ?? []).map((c) => ({ label: c.category, value: c.count }))}
          />
        </Card>
      </div>

      <Card className="p-5">
        <h2 className="mb-4 text-sm font-semibold text-secondary dark:text-white">Recently Updated</h2>
        <div className="space-y-3">
          {(data?.recentlyUpdated ?? []).map((p) => (
            <div
              key={p._id}
              className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0 dark:border-surface-dark-border"
            >
              <div>
                <p className="text-sm font-medium text-secondary dark:text-white">{p.title}</p>
                <p className="text-xs text-slate-400">
                  {p.department?.name} &middot; {p.category?.name}
                </p>
              </div>
              <StatusBadge status={p.status as ProcedureStatus} />
            </div>
          ))}
          {!isLoading && (data?.recentlyUpdated ?? []).length === 0 && (
            <p className="text-sm text-slate-400">No procedures yet.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
