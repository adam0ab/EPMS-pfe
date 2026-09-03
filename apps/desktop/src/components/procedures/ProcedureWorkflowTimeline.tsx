import { ProcedureDTO, ProcedureStatus, ValidationAction, ValidationHistoryDTO } from "@epms/shared";
import { Card } from "../ui/Card";
import { useValidationHistory } from "../../hooks/useProcedures";

type Tone = "slate" | "blue" | "amber" | "green" | "red";

const stages = [
  { status: ProcedureStatus.DRAFT, label: "Brouillon", short: "DRAFT", tone: "slate" as Tone, icon: "✎" },
  { status: ProcedureStatus.PENDING_REVIEW, label: "En validation", short: "PENDING_REVIEW", tone: "amber" as Tone, icon: "⌛" },
  { status: ProcedureStatus.APPROVED, label: "Approuvée", short: "APPROVED", tone: "blue" as Tone, icon: "✓" },
  { status: ProcedureStatus.PUBLISHED, label: "Publiée", short: "PUBLISHED", tone: "green" as Tone, icon: "↗" },
  { status: ProcedureStatus.ARCHIVED, label: "Archivée", short: "ARCHIVED", tone: "slate" as Tone, icon: "▣" },
];

const tones: Record<Tone, { active: string; idle: string; line: string }> = {
  slate: { active: "border-slate-500 bg-slate-600 text-white shadow-slate-300/60", idle: "border-slate-200 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-800", line: "bg-slate-400" },
  blue: { active: "border-primary bg-primary text-white shadow-primary/30", idle: "border-primary/20 bg-primary-50 text-primary dark:bg-primary/10", line: "bg-primary" },
  amber: { active: "border-amber-500 bg-amber-500 text-white shadow-amber-300/60", idle: "border-amber-200 bg-amber-50 text-amber-600 dark:bg-amber-500/10", line: "bg-amber-400" },
  green: { active: "border-emerald-600 bg-emerald-600 text-white shadow-emerald-300/60", idle: "border-emerald-200 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10", line: "bg-emerald-500" },
  red: { active: "border-red-600 bg-red-600 text-white shadow-red-300/60", idle: "border-red-200 bg-red-50 text-red-600 dark:bg-red-500/10", line: "bg-red-500" },
};

const actionLabels: Record<ValidationAction, string> = {
  [ValidationAction.SUBMITTED]: "Soumise pour validation",
  [ValidationAction.APPROVED]: "Approuvée",
  [ValidationAction.REJECTED]: "Rejetée",
  [ValidationAction.RETURNED_TO_DRAFT]: "Retournée en brouillon",
  [ValidationAction.PUBLISHED]: "Publiée",
  [ValidationAction.ARCHIVED]: "Archivée",
};

const actionIcons: Record<ValidationAction, string> = {
  [ValidationAction.SUBMITTED]: "⌛", [ValidationAction.APPROVED]: "✓", [ValidationAction.REJECTED]: "!",
  [ValidationAction.RETURNED_TO_DRAFT]: "↶", [ValidationAction.PUBLISHED]: "↗", [ValidationAction.ARCHIVED]: "▣",
};

function actorName(actor: ValidationHistoryDTO["actor"]) { return typeof actor === "string" ? "Utilisateur supprimé" : actor.fullName; }
function date(value?: string) { return value ? new Date(value).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" }) : "—"; }
function historyFor(status: ProcedureStatus, history: ValidationHistoryDTO[]) {
  const actionByStatus: Partial<Record<ProcedureStatus, ValidationAction>> = {
    [ProcedureStatus.PENDING_REVIEW]: ValidationAction.SUBMITTED, [ProcedureStatus.APPROVED]: ValidationAction.APPROVED,
    [ProcedureStatus.REJECTED]: ValidationAction.REJECTED, [ProcedureStatus.PUBLISHED]: ValidationAction.PUBLISHED,
    [ProcedureStatus.ARCHIVED]: ValidationAction.ARCHIVED,
  };
  const wanted = actionByStatus[status];
  return wanted ? [...history].reverse().find((entry) => entry.action === wanted) : undefined;
}

export function ProcedureWorkflowTimeline({ procedure }: { procedure: ProcedureDTO }) {
  const { data: history = [], isLoading, isError, error } = useValidationHistory(procedure._id);
  const isRejected = procedure.status === ProcedureStatus.REJECTED;
  const currentIndex = stages.findIndex((stage) => stage.status === procedure.status);
  const rejection = [...history].reverse().find((entry) => entry.action === ValidationAction.REJECTED);

  return <div className="space-y-6">
    <Card className="overflow-hidden p-0">
      <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-5 py-4 dark:border-slate-800 dark:from-slate-900 dark:to-slate-900">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Cycle de vie</p>
        <h2 className="mt-1 text-lg font-semibold text-secondary dark:text-white">Statut actuel : {isRejected ? "Rejetée" : stages[currentIndex]?.label}</h2>
      </div>
      <div className="overflow-x-auto px-5 py-6">
        <div className="min-w-[700px]">
          <div className="flex items-start">
            {stages.map((stage, index) => {
              const isCurrent = !isRejected && index === currentIndex;
              const isPast = !isRejected && index < currentIndex;
              const entry = historyFor(stage.status, history);
              const tone = tones[stage.tone];
              return <div key={stage.status} className="flex min-w-0 flex-1 items-start">
                <div className="w-full text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border-2 text-lg font-bold transition-all duration-300 motion-safe:group-hover:scale-105">
                    <span className={isCurrent ? `flex h-10 w-10 animate-pulse items-center justify-center rounded-full border-2 shadow-lg ${tone.active}` : isPast ? `flex h-10 w-10 items-center justify-center rounded-full border-2 ${tone.idle}` : `flex h-10 w-10 items-center justify-center rounded-full border-2 ${tones.slate.idle}`}>{isPast ? "✓" : stage.icon}</span>
                  </div>
                  <p className={`mt-3 text-xs font-semibold ${isCurrent ? "text-secondary dark:text-white" : isPast ? "text-slate-600 dark:text-slate-300" : "text-slate-400"}`}>{stage.label}</p>
                  <p className="mt-1 text-[10px] text-slate-400">{entry ? date(entry.createdAt) : isCurrent && stage.status === ProcedureStatus.DRAFT ? date(procedure.createdAt) : "À venir"}</p>
                </div>
                {index < stages.length - 1 && <div className={`mt-5 h-0.5 flex-1 ${!isRejected && index < currentIndex ? tone.line : "bg-slate-200 dark:bg-slate-700"}`} />}
              </div>;
            })}
          </div>
          {isRejected && <div className="mx-auto mt-6 max-w-md rounded-xl border border-red-200 bg-red-50 p-4 text-center dark:border-red-900/60 dark:bg-red-950/30">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-red-600 font-bold text-white">!</span>
            <p className="mt-2 font-semibold text-red-800 dark:text-red-200">REJECTED — retour requis vers DRAFT</p>
            <p className="mt-1 text-sm text-red-700 dark:text-red-300">La procédure doit être modifiée avant une nouvelle soumission.</p>
          </div>}
        </div>
      </div>
    </Card>

    {isRejected && <Card className="border border-red-200 bg-red-50/50 p-5 dark:border-red-900/60 dark:bg-red-950/20">
      <h2 className="text-sm font-semibold text-red-800 dark:text-red-200">Motif du rejet</h2>
      <p className="mt-2 text-sm text-red-700 dark:text-red-300">{rejection?.comment || procedure.lastValidationComment || "Aucun commentaire n’a été enregistré."}</p>
      <p className="mt-3 text-xs text-red-600/80 dark:text-red-300/80">Validateur : {rejection ? actorName(rejection.actor) : "Non renseigné"} · {date(rejection?.createdAt)}</p>
    </Card>}

    <Card className="p-5">
      <div className="flex items-center justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Traçabilité</p><h2 className="mt-1 text-lg font-semibold text-secondary dark:text-white">Historique de validation</h2></div>{isLoading && <span className="text-xs text-slate-400">Chargement…</span>}</div>
      {isError ? <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">Impossible de charger l’historique. {error instanceof Error ? error.message : "Réessayez ultérieurement."}</p> :
        !isLoading && history.length === 0 ? <p className="mt-4 rounded-lg bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-800">Aucune action de validation n’a encore été enregistrée.</p> :
          <ol className="mt-5 space-y-0">{history.map((entry, index) => <li key={entry._id} className="relative flex gap-3 pb-6 last:pb-0">
            {index < history.length - 1 && <span className="absolute left-[15px] top-8 h-[calc(100%-12px)] w-px bg-slate-200 dark:bg-slate-700" />}
            <span className={`z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${entry.action === ValidationAction.REJECTED ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300" : "bg-primary-50 text-primary dark:bg-primary/15"}`}>{actionIcons[entry.action]}</span>
            <div className="min-w-0 pt-1"><p className="text-sm font-semibold text-secondary dark:text-white">{actionLabels[entry.action]}</p><p className="mt-0.5 text-xs text-slate-500">{actorName(entry.actor)} · {date(entry.createdAt)}</p>{entry.comment && <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">{entry.comment}</p>}</div>
          </li>)}</ol>}
    </Card>
  </div>;
}
