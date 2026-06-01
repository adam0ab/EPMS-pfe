import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ProcedureStatus, Role } from "@epms/shared";
import { useProcedure, useArchiveProcedure, useDeleteProcedure, usePublishProcedure } from "../../hooks/useProcedures";
import { useAuthStore } from "../../store/auth.store";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { StatusBadge } from "../../components/ui/Badge";
import { ProcedureFormModal } from "../../components/procedures/ProcedureFormModal";
import { AttachmentsCard } from "../../components/procedures/AttachmentsCard";
import { AiAssistantCard } from "../../components/procedures/AiAssistantCard";

export default function ProcedureDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const role = useAuthStore((s) => s.user?.role);
  const { data: procedure, isLoading } = useProcedure(id);
  const publish = usePublishProcedure();
  const archive = useArchiveProcedure();
  const remove = useDeleteProcedure();
  const [isEditOpen, setEditOpen] = useState(false);

  if (isLoading || !procedure) {
    return <p className="text-sm text-slate-400">Loading…</p>;
  }

  const isAdmin = role === Role.SUPER_ADMIN;
  const department = typeof procedure.department === "object" ? procedure.department.name : "";
  const category = typeof procedure.category === "object" ? procedure.category.name : "";

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <button onClick={() => navigate(-1)} className="mb-2 text-sm text-slate-400 hover:text-secondary">
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-secondary dark:text-white">{procedure.title}</h1>
          <div className="mt-2 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <StatusBadge status={procedure.status} />
            <span>{department}</span>
            <span>&middot;</span>
            <span>{category}</span>
            <span>&middot;</span>
            <span>v{procedure.versionNumber}</span>
          </div>
        </div>

        {isAdmin && (
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setEditOpen(true)}>
              Edit
            </Button>
            {procedure.status !== ProcedureStatus.PUBLISHED && (
              <Button variant="secondary" onClick={() => publish.mutate(procedure._id)}>
                Publish
              </Button>
            )}
            {procedure.status !== ProcedureStatus.ARCHIVED && (
              <Button variant="secondary" onClick={() => archive.mutate(procedure._id)}>
                Archive
              </Button>
            )}
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
                {step.description}
              </li>
            ))}
            {procedure.steps.length === 0 && <p className="text-slate-400">No steps defined.</p>}
          </ol>
        </Card>

        <div className="space-y-6">
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
              <div className="flex justify-between">
                <dt className="text-slate-400">Last Update</dt>
                <dd className="text-secondary dark:text-white">
                  {new Date(procedure.lastUpdate).toLocaleDateString()}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">Views</dt>
                <dd className="text-secondary dark:text-white">{procedure.viewCount}</dd>
              </div>
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

      <ProcedureFormModal open={isEditOpen} onClose={() => setEditOpen(false)} procedure={procedure} />
    </div>
  );
}
