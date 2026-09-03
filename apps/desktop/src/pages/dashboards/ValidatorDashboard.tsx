import { useNavigate } from "react-router-dom";
import { Card, StatCard } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { StatusBadge } from "../../components/ui/Badge";
import { DashboardSection } from "../../components/dashboard/DashboardSection";
import { useValidatorDashboard } from "../../hooks/useDashboard";
import { useAuthStore } from "../../store/auth.store";
import { ProcedureIcon, DashboardIcon } from "../../components/layout/icons";
import { ProcedureStatus } from "@epms/shared";

function creatorName(creator?: { fullName: string } | string) { return typeof creator === "object" ? creator.fullName : "Unknown creator"; }

export default function ValidatorDashboard() {
  const navigate = useNavigate(); const user = useAuthStore((state) => state.user); const { data, isLoading } = useValidatorDashboard();
  const firstName = user?.fullName.split(" ")[0] ?? "";
  return <div className="space-y-8"><header><p className="text-sm font-semibold text-primary">Validation workspace</p><h1 className="mt-1 text-3xl font-bold text-secondary dark:text-white">Bonjour, {firstName}</h1><p className="mt-2 text-slate-500">Voici les procédures nécessitant votre attention.</p></header>
    <div className="grid gap-4 sm:grid-cols-3"><StatCard label="Pending review" value={data?.pendingProcedures ?? (isLoading ? "…" : 0)} accent="warning" icon={<ProcedureIcon />} /><StatCard label="Approved" value={data?.approvedProcedures ?? (isLoading ? "…" : 0)} accent="success" icon={<DashboardIcon />} /><StatCard label="Rejected" value={data?.rejectedProcedures ?? (isLoading ? "…" : 0)} accent="danger" icon={<DashboardIcon />} /></div>
    <DashboardSection title="Procedures awaiting validation" description="Newest submissions are shown first." action={<Button size="sm" onClick={() => navigate("/procedures?status=pending_review")}>Open review queue</Button>}><div className="grid gap-4 lg:grid-cols-2">{data?.recentlySubmitted.map((procedure) => <Card key={procedure._id} className="p-5"><div className="flex items-start justify-between gap-4"><div className="min-w-0"><h3 className="truncate font-semibold text-secondary dark:text-white">{procedure.title}</h3><p className="mt-1 text-sm text-slate-500">{procedure.department?.name} · {procedure.category?.name}</p></div><StatusBadge status={procedure.status as ProcedureStatus} /></div><dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2"><div><dt className="text-xs text-slate-400">Created by</dt><dd className="mt-1 text-slate-600 dark:text-slate-300">{creatorName(procedure.createdBy)}</dd></div><div><dt className="text-xs text-slate-400">Submitted</dt><dd className="mt-1 text-slate-600 dark:text-slate-300">{procedure.submittedAt ? new Date(procedure.submittedAt).toLocaleString("fr-FR") : "Not recorded"}</dd></div></dl><div className="mt-5"><Button size="sm" onClick={() => navigate(`/procedures/${procedure._id}/workflow`)}>Review</Button></div></Card>)}{!isLoading && !data?.recentlySubmitted.length && <Card className="p-5 text-sm text-slate-500">No procedure is currently awaiting review.</Card>}</div></DashboardSection>
    <DashboardSection title="Your recent validation activity" description="Actions you have recorded in procedure workflows."><Card className="divide-y divide-slate-100 p-5 dark:divide-slate-800">{data?.recentValidationActivity.map((entry) => <div key={entry._id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"><div><p className="text-sm font-medium text-secondary dark:text-white">{entry.procedureId?.title ?? "Procedure"}</p><p className="text-xs text-slate-500">{entry.action.replace(/_/g, " ")} · {new Date(entry.createdAt).toLocaleString("fr-FR")}</p>{entry.comment && <p className="mt-1 text-xs text-slate-500">{entry.comment}</p>}</div><Button size="sm" variant="ghost" onClick={() => entry.procedureId && navigate(`/procedures/${entry.procedureId._id}/workflow`)}>Open</Button></div>)}{!isLoading && !data?.recentValidationActivity.length && <p className="text-sm text-slate-400">No validation activity yet.</p>}</Card></DashboardSection>
  </div>;
}
