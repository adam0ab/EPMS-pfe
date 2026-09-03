import { useState, useMemo } from "react";
import { Card, StatCard } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Field";
import { StatusBadge } from "../../components/ui/Badge";
import { reportsApi } from "../../api/reports.api";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LabelList,
} from "recharts";

const PERIODS = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "1y", label: "Last year" },
  { value: "all", label: "All time" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "draft", label: "Draft" },
  { value: "pending_review", label: "Pending Review" },
  { value: "approved", label: "Approved" },
  { value: "published", label: "Published" },
  { value: "rejected", label: "Rejected" },
  { value: "archived", label: "Archived" },
];

const WORKFLOW_STATUS_META: Record<string, { label: string; color: string }> = {
  draft: { label: "Brouillon", color: "#64748b" },
  pending_review: { label: "En validation", color: "#3b82f6" },
  approved: { label: "Approuvée", color: "#10b981" },
  published: { label: "Publiée", color: "#22c55e" },
  rejected: { label: "Rejetée", color: "#ef4444" },
  archived: { label: "Archivée", color: "#f59e0b" },
};

function InsightIcon({ type }: { type: string }) {
  const colors: Record<string, string> = { success: "bg-emerald-100 text-emerald-700", warning: "bg-amber-100 text-amber-700", danger: "bg-red-100 text-red-700", info: "bg-blue-100 text-blue-700" };
  return <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${colors[type] || colors.info}`}>{type[0].toUpperCase()}</span>;
}

function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = { HIGH: "bg-red-100 text-red-700", MEDIUM: "bg-amber-100 text-amber-700", LOW: "bg-slate-100 text-slate-700" };
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${colors[priority] || colors.LOW}`}>{priority}</span>;
}

export default function ReportsPage() {
  const [period, setPeriod] = useState("all");
  const [status, setStatus] = useState("");
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["reports", period, status],
    queryFn: () => reportsApi.generate({ period: period as "7d" | "30d" | "90d" | "1y" | "all", status: status || undefined }),
  });

  const handleExport = async (format: "pdf" | "excel") => {
    const blob = format === "pdf" ? await reportsApi.downloadPdf({ period: period as "7d" | "30d" | "90d" | "1y" | "all", status: status || undefined }) : await reportsApi.downloadExcel({ period: period as "7d" | "30d" | "90d" | "1y" | "all", status: status || undefined });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `epms-report-${Date.now()}.${format === "pdf" ? "pdf" : "xlsx"}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    setGeneratedAt(new Date().toLocaleString());
  };

  const report = data;
  const summary = report?.executiveSummary;
  const workflow = report?.workflowAnalysis;
  const health = report?.healthAnalysis;
  const validation = report?.validationAnalysis;
  const compliance = report?.complianceAnalysis;
  const deadlines = report?.deadlineAnalysis;
  const age = report?.ageAnalysis;

  const workflowChartData = useMemo(() => {
    if (!workflow) return [];
    return Object.entries(workflow.distribution).map(([status, value]) => {
      const meta = WORKFLOW_STATUS_META[status] ?? { label: status.replace(/_/g, " "), color: "#64748b" };
      return { status, name: meta.label, value, color: meta.color };
    });
  }, [workflow]);

  const healthChartData = useMemo(() => {
    if (!health) return [];
    return [
      { name: "Healthy", value: health.healthy, color: "#22c55e" },
      { name: "At Risk", value: health.atRisk, color: "#f59e0b" },
      { name: "Critical", value: health.critical, color: "#ef4444" },
    ];
  }, [health]);

  const deadlineChartData = useMemo(() => {
    if (!deadlines) return [];
    return [
      { name: "Overdue", value: deadlines.overdue, color: "#ef4444" },
      { name: "Due Soon", value: deadlines.dueSoon, color: "#f59e0b" },
      { name: "Upcoming", value: deadlines.upcoming, color: "#22c55e" },
      { name: "No Deadline", value: deadlines.noDeadline, color: "#94a3b8" },
    ];
  }, [deadlines]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-secondary dark:text-white">Reporting & Decision Center</h1>
          <p className="text-sm text-slate-500">Administrative analytics, insights, and recommended decisions.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select label="" value={period} onChange={(e) => setPeriod(e.target.value)} className="w-40">
            {PERIODS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </Select>
          <Select label="" value={status} onChange={(e) => setStatus(e.target.value)} className="w-44">
            {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </Select>
          <Button variant="secondary" size="sm" onClick={() => refetch()}>Generate Report</Button>
          <Button variant="ghost" size="sm" onClick={() => handleExport("pdf")} disabled={isLoading || !report}>Export PDF</Button>
          <Button variant="ghost" size="sm" onClick={() => handleExport("excel")} disabled={isLoading || !report}>Export Excel</Button>
        </div>
      </div>

      {generatedAt && <p className="text-xs text-slate-400">Last generated: {generatedAt}</p>}

      {isLoading && <Card className="p-6"><p className="text-sm text-slate-500">Generating report…</p></Card>}

      {!isLoading && !report && (
        <Card className="p-6">
          <p className="text-sm text-slate-500">No data available for the selected filters.</p>
        </Card>
      )}

      {!isLoading && report && (
        <div className="space-y-6">
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-secondary dark:text-white">Executive Overview</h2>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Total Procedures" value={summary?.totalProcedures ?? 0} />
              <StatCard label="Published Rate" value={`${summary?.publishedRate.toFixed(1) ?? "0.0"}%`} accent="success" />
              <StatCard label="Approval Rate" value={`${summary?.approvalRate.toFixed(1) ?? "0.0"}%`} accent="success" />
              <StatCard label="Rejection Rate" value={`${summary?.rejectionRate.toFixed(1) ?? "0.0"}%`} accent={summary && summary.rejectionRate > 30 ? "danger" : "warning"} />
              <StatCard label="Validation Backlog" value={summary?.validationBacklog ?? 0} accent={summary && summary.validationBacklog > 5 ? "danger" : "warning"} />
              <StatCard label="Publication Backlog" value={summary?.publicationBacklog ?? 0} accent="info" />
              <StatCard label="At Risk" value={summary?.atRiskProcedures ?? 0} accent="warning" />
              <StatCard label="Critical" value={summary?.criticalProcedures ?? 0} accent="danger" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="p-4"><p className="text-sm text-slate-500">Average Validation Time</p><p className="text-xl font-bold text-secondary dark:text-white">{summary?.averageValidationTimeHours !== null && summary?.averageValidationTimeHours !== undefined ? `${summary.averageValidationTimeHours}h` : "N/A"}</p></Card>
              <Card className="p-4"><p className="text-sm text-slate-500">Average Publication Time</p><p className="text-xl font-bold text-secondary dark:text-white">{summary?.averagePublicationTimeHours !== null && summary?.averagePublicationTimeHours !== undefined ? `${summary.averagePublicationTimeHours}h` : "N/A"}</p></Card>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-3">
            <Card className="p-5 lg:col-span-2">
              <h3 className="mb-4 text-sm font-semibold text-secondary dark:text-white">Workflow Analysis</h3>
              {workflowChartData.length ? <>
                <div className="h-80 min-w-0" aria-label="Répartition des procédures par statut de workflow">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={280}>
                    <BarChart data={workflowChartData} margin={{ top: 24, right: 8, left: -18, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} interval={0} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{ fill: "#f8fafc" }} contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} formatter={(value: number) => [value, "Procédures"]} />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={56}>
                        {workflowChartData.map((entry) => <Cell key={entry.status} fill={entry.color} />)}
                        <LabelList dataKey="value" position="top" fill="#334155" fontSize={12} fontWeight={700} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2" aria-label="Légende des statuts">
                  {workflowChartData.map((entry) => <span key={entry.status} className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />{entry.name}: <strong style={{ color: entry.color }}>{entry.value}</strong></span>)}
                </div>
              </> : <div className="flex h-80 items-center justify-center rounded-lg bg-slate-50 text-sm text-slate-500 dark:bg-slate-800">Aucune donnée de workflow pour les filtres sélectionnés.</div>}
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800"><p className="text-xs text-slate-500">Submission Rate</p><p className="text-lg font-bold text-secondary dark:text-white">{workflow?.submissionRate.toFixed(1) ?? "0.0"}%</p></div>
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800"><p className="text-xs text-slate-500">Approval Rate</p><p className="text-lg font-bold text-secondary dark:text-white">{workflow?.approvalRate.toFixed(1) ?? "0.0"}%</p></div>
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800"><p className="text-xs text-slate-500">Rejection Rate</p><p className="text-lg font-bold text-secondary dark:text-white">{workflow?.rejectionRate.toFixed(1) ?? "0.0"}%</p></div>
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800"><p className="text-xs text-slate-500">Publication Rate</p><p className="text-lg font-bold text-secondary dark:text-white">{workflow?.publicationRate.toFixed(1) ?? "0.0"}%</p></div>
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="mb-4 text-sm font-semibold text-secondary dark:text-white">Workflow Bottlenecks</h3>
              <div className="space-y-3">
                {workflow?.bottlenecks.map((b) => (
                  <div key={b.status} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
                    <div>
                      <p className="text-sm font-semibold text-secondary dark:text-white">{b.status.replace(/_/g, " ").toUpperCase()}</p>
                      <p className="text-xs text-slate-500">{b.label}</p>
                    </div>
                    <span className={`text-lg font-bold ${b.severity === "danger" ? "text-red-600" : b.severity === "warning" ? "text-amber-600" : "text-blue-600"}`}>{b.count}</span>
                  </div>
                ))}
              </div>
            </Card>
          </section>

          <section className="grid gap-6 lg:grid-cols-3">
            <Card className="p-5">
              <h3 className="mb-4 text-sm font-semibold text-secondary dark:text-white">Procedure Health</h3>
              <div className="flex flex-col items-center">
                <div className="h-48 w-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={healthChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4}>
                        {healthChartData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 w-full space-y-2">
                  <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Healthy</span><span className="text-sm font-semibold text-secondary dark:text-white">{health?.healthy} ({health?.total ? ((health.healthy / health.total) * 100).toFixed(1) : "0.0"}%)</span></div>
                  <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> At Risk</span><span className="text-sm font-semibold text-secondary dark:text-white">{health?.atRisk} ({health?.total ? ((health.atRisk / health.total) * 100).toFixed(1) : "0.0"}%)</span></div>
                  <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"><span className="h-2.5 w-2.5 rounded-full bg-red-500" /> Critical</span><span className="text-sm font-semibold text-secondary dark:text-white">{health?.critical} ({health?.total ? ((health.critical / health.total) * 100).toFixed(1) : "0.0"}%)</span></div>
                </div>
                <p className="mt-3 text-xs text-slate-500">Average Score: {health?.averageScore ?? 0}/100</p>
              </div>
            </Card>

            <Card className="p-5 lg:col-span-2">
              <h3 className="mb-4 text-sm font-semibold text-secondary dark:text-white">Validation Performance</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800"><p className="text-xs text-slate-500">Total Submitted</p><p className="text-2xl font-bold text-secondary dark:text-white">{validation?.totalSubmitted ?? 0}</p></div>
                <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800"><p className="text-xs text-slate-500">Approval Rate</p><p className="text-2xl font-bold text-secondary dark:text-white">{validation?.approvalRate.toFixed(1) ?? "0.0"}%</p></div>
                <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800"><p className="text-xs text-slate-500">Rejection Rate</p><p className="text-2xl font-bold text-secondary dark:text-white">{validation?.rejectionRate.toFixed(1) ?? "0.0"}%</p></div>
                <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800"><p className="text-xs text-slate-500">Avg Validation Time</p><p className="text-2xl font-bold text-secondary dark:text-white">{validation?.averageValidationTimeHours !== null && validation?.averageValidationTimeHours !== undefined ? `${validation.averageValidationTimeHours}h` : "N/A"}</p></div>
              </div>
            </Card>
          </section>

          <section className="grid gap-6 lg:grid-cols-3">
            <Card className="p-5">
              <h3 className="mb-4 text-sm font-semibold text-secondary dark:text-white">Compliance & Documentation</h3>
              <div className="space-y-3">
                <div><div className="flex justify-between text-sm"><span className="text-slate-600 dark:text-slate-300">Documentation Coverage</span><span className="font-semibold text-secondary dark:text-white">{compliance?.documentationCoverage.toFixed(1) ?? "0.0"}%</span></div><div className="mt-1 h-2 rounded-full bg-slate-200 dark:bg-slate-700"><div className="h-2 rounded-full bg-primary" style={{ width: `${compliance?.documentationCoverage ?? 0}%` }} /></div></div>
                <div><div className="flex justify-between text-sm"><span className="text-slate-600 dark:text-slate-300">Metadata Completeness</span><span className="font-semibold text-secondary dark:text-white">{compliance?.metadataCompleteness.toFixed(1) ?? "0.0"}%</span></div><div className="mt-1 h-2 rounded-full bg-slate-200 dark:bg-slate-700"><div className="h-2 rounded-full bg-primary" style={{ width: `${compliance?.metadataCompleteness ?? 0}%` }} /></div></div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm"><span className="text-slate-500">With Documents</span><span className="font-semibold text-secondary dark:text-white">{compliance?.withDocuments ?? 0}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-500">Without Documents</span><span className="font-semibold text-secondary dark:text-white">{compliance?.withoutDocuments ?? 0}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-500">With Responsible Person</span><span className="font-semibold text-secondary dark:text-white">{compliance?.withResponsiblePerson ?? 0}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-500">With Deadline</span><span className="font-semibold text-secondary dark:text-white">{compliance?.withDeadline ?? 0}</span></div>
              </div>
            </Card>

            <Card className="p-5 lg:col-span-2">
              <h3 className="mb-4 text-sm font-semibold text-secondary dark:text-white">Deadline Analysis</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deadlineChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {deadlineChartData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </section>

          <section className="grid gap-6 lg:grid-cols-3">
            <Card className="p-5">
              <h3 className="mb-4 text-sm font-semibold text-secondary dark:text-white">Procedure Age</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between"><span className="text-sm text-slate-600 dark:text-slate-300">Recently Updated</span><span className="text-sm font-semibold text-secondary dark:text-white">{age?.recentlyUpdated ?? 0} ({age?.recentlyUpdatedPct ?? 0}%)</span></div>
                <div className="flex items-center justify-between"><span className="text-sm text-slate-600 dark:text-slate-300">Aging (90-180 days)</span><span className="text-sm font-semibold text-secondary dark:text-white">{age?.aging ?? 0} ({age?.agingPct ?? 0}%)</span></div>
                <div className="flex items-center justify-between"><span className="text-sm text-slate-600 dark:text-slate-300">Outdated (≥180 days)</span><span className="text-sm font-semibold text-secondary dark:text-white">{age?.outdated ?? 0} ({age?.outdatedPct ?? 0}%)</span></div>
              </div>
            </Card>

            <Card className="p-5 lg:col-span-2">
              <h3 className="mb-4 text-sm font-semibold text-secondary dark:text-white">Key Insights</h3>
              <div className="space-y-3">
                {report.insights.map((insight, index) => (
                  <div key={index} className="flex gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
                    <InsightIcon type={insight.type} />
                    <div><p className="text-sm font-semibold text-secondary dark:text-white">{insight.title}</p><p className="text-xs text-slate-500">{insight.message}</p></div>
                  </div>
                ))}
                {!report.insights.length && <p className="text-sm text-slate-400">No insights generated for the current data.</p>}
              </div>
            </Card>
          </section>

          <section className="grid gap-6 lg:grid-cols-3">
            <Card className="p-5 lg:col-span-2">
              <h3 className="mb-4 text-sm font-semibold text-secondary dark:text-white">Recommended Decisions</h3>
              <div className="space-y-3">
                {report.decisions.map((decision, index) => (
                  <div key={index} className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-secondary dark:text-white">{decision.title}</p>
                      <PriorityBadge priority={decision.priority} />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{decision.reason}</p>
                    <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">Action: {decision.suggestedAction}</p>
                  </div>
                ))}
                {!report.decisions.length && <p className="text-sm text-slate-400">No decisions recommended at this time.</p>}
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="mb-4 text-sm font-semibold text-secondary dark:text-white">Executive Conclusion</h3>
              <div className="space-y-3">
                <div><p className="text-xs text-slate-500">Overall Status</p><p className="text-lg font-bold text-secondary dark:text-white">{report.conclusion.overallStatus.replace(/_/g, " ")}</p></div>
                <div><p className="text-xs text-slate-500">Main Strength</p><p className="text-sm text-slate-700 dark:text-slate-300">{report.conclusion.mainStrength}</p></div>
                <div><p className="text-xs text-slate-500">Main Weakness</p><p className="text-sm text-slate-700 dark:text-slate-300">{report.conclusion.mainWeakness}</p></div>
                <div><p className="text-xs text-slate-500">Main Risk</p><p className="text-sm text-slate-700 dark:text-slate-300">{report.conclusion.mainRisk}</p></div>
                <div><p className="text-xs text-slate-500">Recommended Priority</p><p className="text-sm text-slate-700 dark:text-slate-300">{report.conclusion.recommendedPriority}</p></div>
              </div>
            </Card>
          </section>
        </div>
      )}
    </div>
  );
}
