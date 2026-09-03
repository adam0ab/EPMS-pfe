import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Role } from "@epms/shared";
import { useProcedure, useDeleteProcedure } from "../../hooks/useProcedures";
import { useAuthStore } from "../../store/auth.store";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { StatusBadge } from "../../components/ui/Badge";
import { ProcedureFormModal } from "../../components/procedures/ProcedureFormModal";
import { AttachmentsCard } from "../../components/procedures/AttachmentsCard";
import { AiAssistantCard } from "../../components/procedures/AiAssistantCard";
import { WorkflowActions } from "../../components/procedures/WorkflowActions";
import { VersionHistory } from "../../components/procedures/VersionHistory";
import { ProcedureWorkflowTimeline } from "../../components/procedures/ProcedureWorkflowTimeline";
import { LinkifiedText } from "../../components/ui/LinkifiedText";
import { ChecklistButton } from "../../components/procedures/ChecklistButton";
import { ProcedureFeedback } from "../../components/procedures/ProcedureFeedback";

export default function ProcedureDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const role = useAuthStore((s) => s.user?.role);
  const { data: procedure, isLoading, isError } = useProcedure(id);
  const remove = useDeleteProcedure();
  const [isEditOpen, setEditOpen] = useState(false);

  if (isLoading) {
    return <p className="text-sm text-slate-400">Loading…</p>;
  }

  if (isError || !procedure) {
    return <Card className="mx-auto max-w-2xl p-6">
      <h1 className="text-lg font-semibold text-secondary dark:text-white">Procedure unavailable</h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">This procedure no longer exists or you do not have permission to view it.</p>
      <Button className="mt-4" size="sm" variant="ghost" onClick={() => navigate("/procedures")}>Back to procedures</Button>
    </Card>;
  }

  const isAdmin = role === Role.SUPER_ADMIN;
  const isStudent = role === Role.STUDENT;
  // A department/category may be missing when an older procedure references a
  // record that was deleted. Never let a missing populated reference crash the
  // whole procedure page.
  const department = typeof procedure.department === "object" ? procedure.department?.name ?? "Unassigned department" : "Unassigned department";
  const category = typeof procedure.category === "object" ? procedure.category?.name ?? "Unassigned category" : "Unassigned category";

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <button onClick={() => navigate(-1)} className="mb-2 text-sm text-slate-400 hover:text-secondary">
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-secondary dark:text-white">{procedure.title}</h1>
          <div className="mt-2 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <span>{department}</span>
            <span>&middot;</span>
            <span>{category}</span>
            {!isStudent && <><span>&middot;</span><StatusBadge status={procedure.status} /><span>&middot;</span><span>v{procedure.versionNumber}</span></>}
          </div>
          <div className="mt-3 flex flex-wrap gap-2"><Button size="sm" onClick={() => navigate(`/procedures/${procedure._id}/workflow`)}>Visualiser la procédure</Button><ChecklistButton procedureId={procedure._id} status={procedure.status} role={role} /></div>
        </div>

        {(isAdmin || role === Role.VALIDATOR) && (
          <div className="flex gap-2">
            <WorkflowActions procedure={procedure} role={role} onModify={() => setEditOpen(true)} />
            {isAdmin && (
              <Button
                variant="danger"
                onClick={() => {
                  if (confirm("Delete this procedure permanently?")) {
                    remove.mutate(procedure._id, { onSuccess: () => navigate("/procedures") });
                  }
                }}
              >
                Delete
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <h2 className="mb-2 text-sm font-semibold text-secondary dark:text-white">Description</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">{procedure.description}</p>

          <h2 className="mb-2 mt-6 text-sm font-semibold text-secondary dark:text-white">Steps</h2>
          <ol className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            {procedure.steps.map((step) => (
              <li key={step.order} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-semibold text-primary dark:bg-primary/10">
                  {step.order}
                </span>
                <span><LinkifiedText text={step.description} /></span>
              </li>
            ))}
            {procedure.steps.length === 0 && <p className="text-slate-400">No steps defined.</p>}
          </ol>
        </Card>

        <div className="space-y-6">
          {!isStudent && <Card className="p-5">
            <h2 className="mb-3 text-sm font-semibold text-secondary dark:text-white">Workflow</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-400">Status</dt>
                <dd className="text-secondary dark:text-white"><StatusBadge status={procedure.status} /></dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">Created</dt>
                <dd className="text-secondary dark:text-white">{new Date(procedure.createdAt).toLocaleString("fr-FR")}</dd>
              </div>
              {procedure.submittedAt && (
                <div className="flex justify-between">
                  <dt className="text-slate-400">Submitted</dt>
                  <dd className="text-secondary dark:text-white">{new Date(procedure.submittedAt).toLocaleString("fr-FR")}</dd>
                </div>
              )}
              {procedure.approvedAt && (
                <div className="flex justify-between">
                  <dt className="text-slate-400">Approved</dt>
                  <dd className="text-secondary dark:text-white">{new Date(procedure.approvedAt).toLocaleString("fr-FR")}</dd>
                </div>
              )}
              {procedure.publishedAt && (
                <div className="flex justify-between">
                  <dt className="text-slate-400">Published</dt>
                  <dd className="text-secondary dark:text-white">{new Date(procedure.publishedAt).toLocaleString("fr-FR")}</dd>
                </div>
              )}
              {procedure.rejectedAt && (
                <div className="flex justify-between">
                  <dt className="text-slate-400">Rejected</dt>
                  <dd className="text-secondary dark:text-white">{new Date(procedure.rejectedAt).toLocaleString("fr-FR")}</dd>
                </div>
              )}
              {procedure.lastValidationComment && (
                <div className="mt-3 rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                  <p className="text-xs font-semibold text-slate-500">Rejection reason</p>
                  <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{procedure.lastValidationComment}</p>
                </div>
              )}
            </dl>
          </Card>}

          <Card className="p-5">
            <h2 className="mb-3 text-sm font-semibold text-secondary dark:text-white">Details</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-400">Responsible</dt>
                <dd className="text-secondary dark:text-white">{procedure.responsiblePerson}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">Effective Date</dt>
                <dd className="text-secondary dark:text-white">
                  {new Date(procedure.effectiveDate).toLocaleDateString()}
                </dd>
              </div>
              {procedure.deadline && <div className="flex justify-between">
                <dt className="text-slate-400">Deadline</dt>
                <dd className="text-secondary dark:text-white">{new Date(procedure.deadline).toLocaleDateString()}</dd>
              </div>}
              {!isStudent && <div className="flex justify-between">
                <dt className="text-slate-400">Last Update</dt>
                <dd className="text-secondary dark:text-white">
                  {new Date(procedure.lastUpdate).toLocaleDateString()}
                </dd>
              </div>}
              {!isStudent && <div className="flex justify-between">
                <dt className="text-slate-400">Views</dt>
                <dd className="text-secondary dark:text-white">{procedure.viewCount}</dd>
              </div>}
            </dl>
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 text-sm font-semibold text-secondary dark:text-white">Keywords</h2>
            <div className="flex flex-wrap gap-2">
              {procedure.keywords.map((k) => (
                <span
                  key={k}
                  className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600 dark:bg-slate-700/50 dark:text-slate-300"
                >
                  {k}
                </span>
              ))}
              {procedure.keywords.length === 0 && <p className="text-sm text-slate-400">None</p>}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 text-sm font-semibold text-secondary dark:text-white">Required Documents</h2>
            <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
              {procedure.requiredDocuments.map((doc) => (
                <li key={doc}>📄 {doc}</li>
              ))}
              {procedure.requiredDocuments.length === 0 && <p className="text-slate-400">None listed.</p>}
            </ul>
          </Card>

          <AiAssistantCard procedureId={procedure._id} />

          <AttachmentsCard procedureId={procedure._id} isAdmin={isAdmin} />
        </div>
      </div>

      {!isStudent && <><ProcedureWorkflowTimeline procedure={procedure} /><VersionHistory procedure={procedure} role={role} /></>}
      {isStudent && <ProcedureFeedback procedureId={procedure._id} />}

      <ProcedureFormModal open={isEditOpen} onClose={() => setEditOpen(false)} procedure={procedure} />
    </div>
  );
}
