import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Role, StudentRecommendationDTO } from "@epms/shared";
import { useProcedures } from "../hooks/useProcedures";
import { useStudentRecommendations } from "../hooks/useRecommendations";
import { useAuthStore } from "../store/auth.store";
import { Card } from "../components/ui/Card";
import { StatusBadge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { ChecklistButton } from "../components/procedures/ChecklistButton";

function deadlineLabel(value?: string) {
  if (!value) return null;
  const days = Math.ceil((new Date(value).getTime() - Date.now()) / 86400000);
  return `Deadline: ${new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}${days >= 0 ? ` (${days === 0 ? "today" : `${days} day${days === 1 ? "" : "s"}`})` : " (passed)"}`;
}

function RecommendationCard({ item, featured = false }: { item: StudentRecommendationDTO; featured?: boolean }) {
  const navigate = useNavigate();
  const procedure = item.procedure;
  const department = typeof procedure.department === "object" ? procedure.department?.name : undefined;
  const category = typeof procedure.category === "object" ? procedure.category?.name : undefined;
  const continuing = item.type === "CONTINUE";
  return <Card className={`flex flex-col p-5 ${featured ? "border-primary/30 bg-primary-50/30 dark:bg-primary/5" : ""}`}>
    <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">{continuing ? "Continue" : category ?? "Procedure"}</p><h3 className="mt-2 text-lg font-semibold text-secondary dark:text-white">{procedure.title}</h3></div><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.priority === "VERY_HIGH" ? "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300" : item.priority === "HIGH" ? "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300" : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"}`}>{item.priority.replace("_", " ")}</span></div>
    <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">{procedure.description}</p>
    <p className="mt-3 text-sm text-slate-500">{department ?? "Department not specified"}</p>
    {procedure.deadline && <p className={`mt-3 text-sm font-medium ${item.priority === "VERY_HIGH" || item.priority === "HIGH" ? "text-amber-700 dark:text-amber-300" : "text-slate-600 dark:text-slate-300"}`}>{deadlineLabel(procedure.deadline)}</p>}
    {item.checklist && <div className="mt-4"><div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300"><span>{item.checklist.completedCount} / {item.checklist.totalCount} tasks completed</span><span>{item.checklist.progressPercent}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700"><div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${item.checklist.progressPercent}%` }} /></div></div>}
    <div className="mt-4 space-y-1">{item.reasons.slice(0, 2).map((reason) => <p key={reason} className="text-xs text-slate-500">{reason}</p>)}</div>
    <div className="mt-auto flex flex-wrap gap-2 pt-5"><Button size="sm" onClick={() => navigate(continuing ? `/my-checklist?procedure=${procedure._id}` : `/procedures/${procedure._id}`)}>{continuing ? "Continue" : "View procedure"}</Button>{!continuing && <ChecklistButton procedureId={procedure._id} status={procedure.status} role={Role.STUDENT} />}</div>
  </Card>;
}

function StudentRecommendations() {
  const { data, isLoading, isError } = useStudentRecommendations();
  if (isLoading) return <div className="mx-auto max-w-7xl space-y-6 page-enter"><div className="h-20 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" /><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="h-72 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />)}</div></div>;
  if (isError || !data) return <div className="mx-auto max-w-7xl page-enter"><Card className="p-10 text-center"><p className="font-semibold text-secondary dark:text-white">Recommendations could not be loaded.</p><p className="mt-2 text-sm text-slate-500">Please try again in a moment.</p></Card></div>;
  const sections = data.sections;
  const hasContext = sections.continue.length > 0 || sections.recommendedForYou.length > 0 || sections.relatedToChecklist.length > 0;
  const groups: Array<[string, string, StudentRecommendationDTO[]]> = [["Recommended for you", "Related to your current checklist and administrative context.", sections.recommendedForYou], ["Deadlines approaching", "Published procedures with real upcoming deadlines.", sections.deadlineApproaching], ["Continue", "Procedures you have started but not yet completed.", sections.continue], ["Related to your checklist", "Procedures with matching category, department, or topics.", sections.relatedToChecklist], [hasContext ? "Explore more" : "Explore procedures", "Published procedures available to students.", sections.explore]];
  return <div className="mx-auto max-w-7xl space-y-9 page-enter"><header><p className="text-sm font-semibold text-primary">Student workspace</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-secondary dark:text-white">Smart Recommendations</h1><p className="mt-2 text-slate-500">Administrative procedures selected using your current checklist and upcoming deadlines.</p></header>{data.nextBestAction && <section><div className="mb-3"><h2 className="text-lg font-semibold text-secondary dark:text-white">Next best action</h2><p className="text-sm text-slate-500">A useful action based on your persisted checklist and published procedure data.</p></div><div className="max-w-xl"><RecommendationCard item={data.nextBestAction} featured /></div></section>}{groups.map(([title, description, items]) => items.length ? <section key={title}><div className="mb-3"><h2 className="text-lg font-semibold text-secondary dark:text-white">{title}</h2><p className="text-sm text-slate-500">{description}</p></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{items.map((item) => <RecommendationCard key={item.procedure._id} item={item} />)}</div></section> : null)}{!groups.some(([, , items]) => items.length) && <Card className="p-10 text-center"><p className="font-semibold text-secondary dark:text-white">No published procedures are available yet.</p><p className="mt-2 text-sm text-slate-500">When student procedures are published, you can explore them here.</p></Card>}</div>;
}

function ProcedureRow({ title, reason, items }: { title: string; reason: string; items: any[] }) {
  const navigate = useNavigate(); const ref = useRef<HTMLDivElement>(null); const [left, setLeft] = useState(false); const [right, setRight] = useState(false);
  const update = () => { const el = ref.current; if (!el) return; setLeft(el.scrollLeft > 2); setRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2); };
  const scroll = (direction: "left" | "right") => { ref.current?.scrollBy({ left: direction === "left" ? -320 : 320, behavior: "smooth" }); window.setTimeout(update, 350); };
  return <section className="relative"><div className="mb-3"><h2 className="text-lg font-semibold text-secondary dark:text-white">{title}</h2><p className="text-sm text-slate-500">{reason}</p></div>{left && <button onClick={() => scroll("left")} className="absolute left-0 top-1/2 z-10 rounded-r-lg bg-white px-3 py-6 text-xl shadow dark:bg-slate-900" aria-label="Scroll left">‹</button>}{right && <button onClick={() => scroll("right")} className="absolute right-0 top-1/2 z-10 rounded-l-lg bg-white px-3 py-6 text-xl shadow dark:bg-slate-900" aria-label="Scroll right">›</button>}<div ref={ref} onScroll={update} className="flex gap-4 overflow-x-auto pb-4">{items.map((p) => <Card key={p._id} onClick={() => navigate(`/procedures/${p._id}`)} className="min-w-[280px] max-w-[280px] cursor-pointer p-5"><div className="flex justify-between gap-3"><h3 className="font-semibold text-secondary dark:text-white">{p.title}</h3><StatusBadge status={p.status} /></div><p className="mt-2 text-sm text-slate-500">{typeof p.department === "object" ? p.department.name : ""} · {typeof p.category === "object" ? p.category.name : ""}</p><p className="mt-3 text-xs text-slate-400">{p.viewCount} consultations</p></Card>)}</div></section>;
}

function StaffRecommendations() {
  const { data, isLoading } = useProcedures({ status: "published", pageSize: 30 }); const items = data?.items ?? []; const sorted = [...items].sort((a, b) => b.viewCount - a.viewCount); const recent = [...items].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  return <div className="space-y-7"><div><h1 className="text-2xl font-bold text-secondary dark:text-white">Recommendations</h1><p className="text-sm text-slate-500">Useful institutional procedures and EPMS trends.</p></div>{isLoading ? <p className="text-sm text-slate-400">Preparing recommendations…</p> : <>{[{ title: "For you", reason: "Relevant institutional procedures", items: items.slice(0, 8) }, { title: "Popular", reason: "Most consulted procedures", items: sorted.slice(0, 8) }, { title: "Recently added", reason: "New published procedures", items: recent.slice(0, 8) }].map((section) => <ProcedureRow key={section.title} {...section} />)}</>}</div>;
}

export default function Recommendations() { const role = useAuthStore((state) => state.user?.role); return role === Role.STUDENT ? <StudentRecommendations /> : <StaffRecommendations />; }
