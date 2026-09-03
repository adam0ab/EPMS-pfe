import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { DashboardSection } from "../../components/dashboard/DashboardSection";
import { useProcedures } from "../../hooks/useProcedures";
import { useAuthStore } from "../../store/auth.store";
import { useChecklistAttention, useStudentChecklists } from "../../hooks/useStudentChecklists";

function dateLabel(value?: string) {
  return value ? new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "Not specified";
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { data: procedureData, isLoading: proceduresLoading } = useProcedures({ pageSize: 100 });
  const { data: checklists = [], isLoading: checklistsLoading } = useStudentChecklists();
  const { data: attention = [], isLoading: attentionLoading } = useChecklistAttention();
  const procedures = procedureData?.items ?? [];
  const firstName = user?.fullName.split(" ")[0] ?? "";
  const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 18 ? "Good afternoon" : "Good evening";
  const inProgress = checklists.filter((item) => !item.isComplete);
  const completed = checklists.filter((item) => item.isComplete);
  const upcomingDeadlines = useMemo(() => procedures
    .filter((procedure) => procedure.deadline && new Date(procedure.deadline).getTime() >= Date.now())
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
    .slice(0, 4), [procedures]);

  return (
    <div className="mx-auto max-w-7xl space-y-8 page-enter">
      <header className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div><p className="text-sm font-semibold text-primary">Student workspace</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-secondary dark:text-white">{greeting}{firstName ? `, ${firstName}` : ""}</h1><p className="mt-2 text-slate-500">Here’s what needs your attention today.</p></div>
        <div className="flex flex-wrap gap-2"><Button size="sm" variant="ghost" onClick={() => navigate("/procedures")}>Search procedures</Button><Button size="sm" onClick={() => navigate("/my-checklist")}>Open my checklist</Button></div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Personal overview">
        <OverviewCard label="My Checklist" value={checklistsLoading ? "…" : checklists.length} detail="Saved procedures" onClick={() => navigate("/my-checklist")} />
        <OverviewCard label="In Progress" value={checklistsLoading ? "…" : inProgress.length} detail="Procedures to continue" onClick={() => navigate("/my-checklist")} />
        <OverviewCard label="Completed" value={checklistsLoading ? "…" : completed.length} detail="Completed procedures" onClick={() => navigate("/my-checklist")} />
        <OverviewCard label="Needs Attention" value={attentionLoading ? "…" : attention.length} detail="Checklist items remaining" onClick={() => document.getElementById("needs-attention")?.scrollIntoView({ behavior: "smooth" })} />
      </section>

      <DashboardSection id="needs-attention" title="Needs your attention" description="Continue procedures with checklist tasks still remaining." action={<Button size="sm" variant="ghost" onClick={() => navigate("/my-checklist")}>Open checklist</Button>}>
        {attentionLoading ? <div className="h-36 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" /> : !attention.length ? <Card className="border-emerald-100 bg-emerald-50/40 p-5 text-sm text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-200">You’re all caught up.</Card> : <div className="grid gap-4 md:grid-cols-2">{attention.map((checklist) => <Card key={checklist._id} className="p-5"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-600">Checklist incomplete</p><h3 className="mt-2 font-semibold text-secondary dark:text-white">{checklist.procedure.title}</h3><p className="mt-2 text-sm text-slate-500">{checklist.totalCount - checklist.completedCount} task{checklist.totalCount - checklist.completedCount === 1 ? "" : "s"} remaining</p><div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-primary" style={{ width: `${checklist.progressPercent}%` }} /></div><Button size="sm" className="mt-4" onClick={() => navigate(`/my-checklist?procedure=${checklist.procedure._id}`)}>Continue</Button></Card>)}</div>}
      </DashboardSection>

      <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        <DashboardSection title="My procedures" description="Procedures you have added to your personal checklist." action={<Button size="sm" variant="ghost" onClick={() => navigate("/my-checklist")}>View all</Button>}>
          {checklistsLoading ? <div className="h-40 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" /> : !checklists.length ? <Card className="p-5 text-sm text-slate-500">No procedures in your checklist yet. Browse procedures to get started.</Card> : <div className="space-y-3">{checklists.slice(0, 4).map((checklist) => <button key={checklist._id} onClick={() => navigate(`/my-checklist?procedure=${checklist.procedure._id}`)} className="flex w-full items-center justify-between rounded-xl border border-slate-200 p-4 text-left transition hover:border-primary/40 hover:bg-primary-50/30 dark:border-slate-800 dark:hover:bg-primary/5"><span><span className="block font-medium text-secondary dark:text-white">{checklist.procedure.title}</span><span className="mt-1 block text-sm text-slate-500">{checklist.completedCount} / {checklist.totalCount} tasks completed</span></span><span className={checklist.isComplete ? "text-sm font-semibold text-emerald-600" : "text-sm font-semibold text-primary"}>{checklist.isComplete ? "Completed" : `${checklist.progressPercent}%`}</span></button>)}</div>}
        </DashboardSection>
        <DashboardSection title="Upcoming deadlines" description="Dates from procedures available to you." action={<Button size="sm" variant="ghost" onClick={() => navigate("/calendar")}>Open calendar</Button>}>
          {proceduresLoading ? <div className="h-40 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" /> : !upcomingDeadlines.length ? <Card className="p-5 text-sm text-slate-500">No upcoming deadlines.</Card> : <div className="space-y-3">{upcomingDeadlines.map((procedure) => <button key={procedure._id} onClick={() => navigate(`/procedures/${procedure._id}`)} className="flex w-full gap-3 rounded-xl border border-slate-200 p-4 text-left transition hover:border-primary/40 hover:bg-primary-50/30 dark:border-slate-800 dark:hover:bg-primary/5"><span className="min-w-16 text-sm font-semibold text-primary">{dateLabel(procedure.deadline)}</span><span><span className="block font-medium text-secondary dark:text-white">{procedure.title}</span><span className="mt-1 block text-sm text-slate-500">Deadline</span></span></button>)}</div>}
        </DashboardSection>
      </div>

      <DashboardSection title="Useful procedures" description="Published procedures available in your student workspace." action={<Button size="sm" variant="ghost" onClick={() => navigate("/recommendations")}>See recommendations</Button>}>
        {proceduresLoading ? <div className="h-40 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" /> : <div className="grid gap-4 md:grid-cols-3">{procedures.slice(0, 3).map((procedure) => <Card key={procedure._id} className="flex min-h-44 flex-col p-5"><h3 className="font-semibold text-secondary dark:text-white">{procedure.title}</h3><p className="mt-2 line-clamp-2 text-sm text-slate-500">{procedure.description}</p><Button size="sm" variant="ghost" className="mt-auto self-start pt-4" onClick={() => navigate(`/procedures/${procedure._id}`)}>View procedure</Button></Card>)}{!procedures.length && <p className="text-sm text-slate-500">No procedures are available yet.</p>}</div>}
      </DashboardSection>

      <Card className="flex flex-col justify-between gap-4 border-primary/20 bg-primary-50/40 p-5 sm:flex-row sm:items-center dark:bg-primary/10"><div><h2 className="font-semibold text-secondary dark:text-white">What would you like to do?</h2><p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Use the student tools already connected to EPMS.</p></div><div className="flex flex-wrap gap-2"><Button size="sm" variant="ghost" onClick={() => navigate("/calendar")}>Calendar</Button><Button size="sm" variant="ghost" onClick={() => navigate("/notifications")}>Notifications</Button><Button size="sm" onClick={() => navigate("/procedures/assistant")}>Ask AI Assistant</Button></div></Card>
    </div>
  );
}

function OverviewCard({ label, value, detail, onClick }: { label: string; value: string | number; detail: string; onClick: () => void }) {
  return <Card className="cursor-pointer p-5 transition hover:border-primary/40 hover:shadow-sm" onClick={onClick}><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-3 text-3xl font-bold text-secondary dark:text-white">{value}</p><p className="mt-1 text-xs text-slate-400">{detail}</p></Card>;
}
