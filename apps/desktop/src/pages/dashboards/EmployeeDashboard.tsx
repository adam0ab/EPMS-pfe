import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { DashboardSection } from "../../components/dashboard/DashboardSection";
import { useCategories } from "../../hooks/useCategories";
import { useDepartments } from "../../hooks/useDepartments";
import { useProcedures } from "../../hooks/useProcedures";
import { useAuthStore } from "../../store/auth.store";

function dateLabel(value?: string) {
  return value ? new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "Not specified";
}

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { data, isLoading } = useProcedures({ pageSize: 100 });
  const { data: departments = [] } = useDepartments();
  const { data: categories = [] } = useCategories();
  const procedures = data?.items ?? [];
  const firstName = user?.fullName.split(" ")[0] ?? "";
  const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 18 ? "Good afternoon" : "Good evening";
  const recentlyUpdated = useMemo(() => [...procedures].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 4), [procedures]);
  const deadlines = useMemo(() => procedures.filter((procedure) => procedure.deadline && new Date(procedure.deadline).getTime() >= Date.now()).sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime()).slice(0, 4), [procedures]);

  return <div className="mx-auto max-w-7xl space-y-8 page-enter"><header className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><p className="text-sm font-semibold text-primary">Administrative workspace</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-secondary dark:text-white">{greeting}{firstName ? `, ${firstName}` : ""}</h1><p className="mt-2 text-slate-500">Access procedures and administrative information relevant to your role.</p></div><div className="flex flex-wrap gap-2"><Button size="sm" variant="ghost" onClick={() => navigate("/calendar")}>View calendar</Button><Button size="sm" onClick={() => navigate("/procedures")}>Browse procedures</Button></div></header>
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Available Procedures" value={isLoading ? "…" : procedures.length} detail="Published for your workspace" onClick={() => navigate("/procedures")} /><Metric label="Departments" value={departments.length} detail="Institutional departments" onClick={() => navigate("/procedures")} /><Metric label="Categories" value={categories.length} detail="Procedure categories" onClick={() => navigate("/procedures")} /><Metric label="Upcoming Deadlines" value={isLoading ? "…" : deadlines.length} detail="Dates in accessible procedures" onClick={() => navigate("/calendar")} /></section>
    <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]"><DashboardSection title="Recently updated procedures" description="Latest published administrative references available to your role." action={<Button size="sm" variant="ghost" onClick={() => navigate("/procedures")}>All procedures</Button>}>{isLoading ? <div className="h-52 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" /> : !recentlyUpdated.length ? <Card className="p-5 text-sm text-slate-500">No procedures available.</Card> : <div className="space-y-3">{recentlyUpdated.map((procedure) => <button key={procedure._id} onClick={() => navigate(`/procedures/${procedure._id}/workflow`)} className="flex w-full items-center justify-between gap-4 rounded-xl border border-slate-200 p-4 text-left transition hover:border-primary/40 hover:bg-primary-50/30 dark:border-slate-800 dark:hover:bg-primary/5"><span><span className="block font-medium text-secondary dark:text-white">{procedure.title}</span><span className="mt-1 block text-sm text-slate-500">Updated {dateLabel(procedure.updatedAt)}</span></span><span className="text-sm font-medium text-primary">Open</span></button>)}</div>}</DashboardSection>
      <DashboardSection title="Administrative deadlines" description="Upcoming dates from procedures available to your role." action={<Button size="sm" variant="ghost" onClick={() => navigate("/calendar")}>Calendar</Button>}>{isLoading ? <div className="h-52 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" /> : !deadlines.length ? <Card className="p-5 text-sm text-slate-500">No upcoming deadlines.</Card> : <div className="space-y-3">{deadlines.map((procedure) => <button key={procedure._id} onClick={() => navigate(`/procedures/${procedure._id}/workflow`)} className="flex w-full gap-3 rounded-xl border border-slate-200 p-4 text-left transition hover:border-primary/40 hover:bg-primary-50/30 dark:border-slate-800 dark:hover:bg-primary/5"><span className="min-w-16 text-sm font-semibold text-primary">{dateLabel(procedure.deadline)}</span><span><span className="block font-medium text-secondary dark:text-white">{procedure.title}</span><span className="mt-1 block text-sm text-slate-500">Procedure deadline</span></span></button>)}</div>}</DashboardSection></div>
    <DashboardSection title="Administrative reference" description="Open a procedure to review its execution steps, documents, and related information."><Card className="flex flex-col justify-between gap-4 border-primary/20 bg-primary-50/40 p-5 sm:flex-row sm:items-center dark:bg-primary/10"><p className="text-sm text-slate-600 dark:text-slate-300">Need help interpreting an administrative procedure?</p><div className="flex flex-wrap gap-2"><Button size="sm" variant="ghost" onClick={() => navigate("/recommendations")}>Recommendations</Button><Button size="sm" variant="ghost" onClick={() => navigate("/notifications")}>Notifications</Button><Button size="sm" onClick={() => navigate("/procedures/assistant")}>Ask AI Assistant</Button></div></Card></DashboardSection>
  </div>;
}

function Metric({ label, value, detail, onClick }: { label: string; value: string | number; detail: string; onClick: () => void }) {
  return <Card className="cursor-pointer p-5 transition hover:border-primary/40 hover:shadow-sm" onClick={onClick}><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-3 text-3xl font-bold text-secondary dark:text-white">{value}</p><p className="mt-1 text-xs text-slate-400">{detail}</p></Card>;
}
