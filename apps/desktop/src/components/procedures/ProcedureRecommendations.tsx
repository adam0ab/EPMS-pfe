import { useNavigate } from "react-router-dom";
import { Card } from "../ui/Card";
import { StatusBadge } from "../ui/Badge";
import { useProcedureRecommendations } from "../../hooks/useProcedures";

export function ProcedureRecommendations({ procedureId }: { procedureId: string }) {
  const navigate = useNavigate(); const { data: procedures, isLoading, isError } = useProcedureRecommendations(procedureId);
  return <Card className="p-5"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Discover</p><h2 className="mt-1 text-lg font-semibold text-secondary dark:text-white">Related procedures</h2>
    {isLoading ? <div className="mt-5 space-y-3">{[1, 2, 3].map((key) => <div key={key} className="h-16 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />)}</div> : isError ? <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">Unable to load recommendations.</p> : !procedures?.length ? <p className="mt-4 rounded-lg bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-800">No related procedure is available.</p> : <ul className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">{procedures.slice(0, 5).map((item) => { const department = typeof item.department === "object" ? item.department.name : undefined; const category = typeof item.category === "object" ? item.category.name : undefined; return <li key={item._id}><button className="w-full py-4 text-left transition-colors hover:bg-slate-50 focus-ring dark:hover:bg-slate-800/60" onClick={() => navigate(`/procedures/${item._id}/workflow`)}><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-semibold text-secondary dark:text-white">{item.title}</p>{(department || category) && <p className="mt-1 text-xs text-slate-500">{[department, category].filter(Boolean).join(" · ")}</p>}</div><StatusBadge status={item.status} /></div><p className="mt-2 text-xs text-primary">Version {item.versionNumber} · View Procedure 360 →</p></button></li>; })}</ul>}
  </Card>;
}
