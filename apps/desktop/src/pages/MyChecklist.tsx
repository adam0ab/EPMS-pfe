import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useSetChecklistStep, useStudentChecklists } from "../hooks/useStudentChecklists";

function categoryName(category: { name?: string } | string | null | undefined) { return typeof category === "object" ? category?.name : category; }

export default function MyChecklist() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const focusedProcedure = params.get("procedure");
  const [expandedProcedure, setExpandedProcedure] = useState<string | null>(focusedProcedure);
  const { data: checklists = [], isLoading, isError } = useStudentChecklists();
  const setStep = useSetChecklistStep();
  const items = focusedProcedure ? checklists.filter((item) => item.procedure._id === focusedProcedure) : checklists;

  useEffect(() => setExpandedProcedure(focusedProcedure), [focusedProcedure]);

  if (isLoading) return <div className="mx-auto max-w-5xl divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800">{[1, 2, 3, 4].map((item) => <div key={item} className="h-28 animate-pulse bg-slate-50 dark:bg-slate-900" />)}</div>;
  if (isError) return <Card className="p-6 text-sm text-danger">Unable to load your checklist. Please try again.</Card>;

  return <div className="mx-auto max-w-5xl space-y-6 page-enter"><header><p className="text-sm font-semibold text-primary">Student space</p><h1 className="mt-1 text-3xl font-bold text-secondary dark:text-white">My Procedure Checklist</h1><p className="mt-2 text-sm text-slate-500">Select a procedure to view and complete its saved steps.</p></header>
    {!items.length ? <Card className="p-10 text-center"><p className="text-2xl">✓</p><h2 className="mt-3 font-semibold text-secondary dark:text-white">No procedures in your checklist yet</h2><p className="mt-2 text-sm text-slate-500">Open a published procedure and select “Add to My Checklist”.</p><Button className="mt-5" onClick={() => navigate("/procedures")}>Browse procedures</Button></Card> : <div className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">{items.map((checklist) => {
      const expanded = expandedProcedure === checklist.procedure._id;
      return <section key={checklist._id} className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/30"><button type="button" aria-expanded={expanded} onClick={() => setExpandedProcedure(expanded ? null : checklist.procedure._id)} className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40"><div className="min-w-0 flex-1"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">{categoryName(checklist.procedure.category) || "Procedure"}</p><h2 className="mt-1 truncate text-lg font-semibold text-secondary dark:text-white">{checklist.procedure.title}</h2><p className="mt-2 text-sm text-slate-500">{checklist.completedCount} / {checklist.totalCount} tasks completed</p><div role="img" aria-label={`${checklist.progressPercent}% of tasks completed`} className="mt-3 flex max-w-xl gap-1">{checklist.steps.map((step) => <span key={step.order} className={`h-2 flex-1 rounded-sm transition-colors ${step.completed ? (checklist.isComplete ? "bg-emerald-500" : "bg-primary") : "bg-slate-200 dark:bg-slate-700"}`} />)}</div></div><div className="flex shrink-0 items-center gap-3"><div className="text-right"><p className={`text-lg font-bold ${checklist.isComplete ? "text-emerald-600 dark:text-emerald-300" : "text-primary"}`}>{checklist.progressPercent}%</p><p className={`hidden text-sm font-semibold sm:block ${checklist.isComplete ? "text-emerald-600 dark:text-emerald-300" : "text-primary"}`}>{checklist.isComplete ? "Completed" : `${checklist.totalCount - checklist.completedCount} remaining`}</p></div><span aria-hidden="true" className="text-lg text-slate-400">{expanded ? "−" : "+"}</span></div></button>{expanded && <div className="border-t border-slate-100 dark:border-slate-800"><div className="px-5 py-3 text-sm font-medium text-slate-500">Procedure steps</div><div className="divide-y divide-slate-100 dark:divide-slate-800">{checklist.steps.map((step) => <label key={step.order} className="flex cursor-pointer items-start gap-4 px-5 py-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40"><input type="checkbox" checked={step.completed} disabled={setStep.isPending} onChange={() => setStep.mutate({ procedureId: checklist.procedure._id, stepOrder: step.order, completed: !step.completed })} className="mt-1 h-4 w-4 accent-primary" /><span className={step.completed ? "text-slate-400 line-through" : "text-secondary dark:text-slate-100"}><span className="mr-2 text-xs font-semibold text-slate-400">{String(step.order).padStart(2, "0")}</span>{step.description}</span></label>)}</div></div>}</section>;
    })}</div>}</div>;
}
