import { FormEvent, useEffect, useState } from "react";
import { ProcedureAudience, ProcedureDTO } from "@epms/shared";
import { Modal } from "../ui/Modal";
import { Select, TextArea, TextInput } from "../ui/Field";
import { Button } from "../ui/Button";
import { useDepartments } from "../../hooks/useDepartments";
import { useCategories } from "../../hooks/useCategories";
import { useCreateProcedure, useUpdateProcedure } from "../../hooks/useProcedures";
import { documentsApi } from "../../api/documents.api";

interface ProcedureFormModalProps {
  open: boolean;
  onClose: () => void;
  procedure?: ProcedureDTO;
}

type ApiFailure = { response?: { data?: { message?: string } } };

function saveErrorMessage(error: unknown): string {
  return (error as ApiFailure | undefined)?.response?.data?.message
    ?? "Unable to save the procedure. Verify the required fields and try again.";
}

function toDateInputValue(value?: string) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

export function ProcedureFormModal({ open, onClose, procedure }: ProcedureFormModalProps) {
  const { data: departments } = useDepartments();
  const { data: categories } = useCategories();
  const createProcedure = useCreateProcedure();
  const updateProcedure = useUpdateProcedure();
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    department: "",
    category: "",
    keywords: "",
    requiredDocuments: "",
    steps: "",
    responsiblePerson: "",
    effectiveDate: "",
    versionNumber: "1.0",
    startDate: "",
    endDate: "",
    deadline: "",
    showInCalendar: false,
    eventType: "",
    targetAudience: [ProcedureAudience.STUDENT, ProcedureAudience.EMPLOYEE] as ProcedureAudience[],
  });

  useEffect(() => {
    if (procedure) {
      setForm({
        title: procedure.title,
        description: procedure.description,
        department: typeof procedure.department === "object" ? procedure.department?._id ?? "" : procedure.department,
        category: typeof procedure.category === "object" ? procedure.category?._id ?? "" : procedure.category,
        keywords: procedure.keywords.join(", "),
        requiredDocuments: procedure.requiredDocuments.join(", "),
        steps: procedure.steps.map((s) => s.description).join("\n"),
        responsiblePerson: procedure.responsiblePerson,
        effectiveDate: toDateInputValue(procedure.effectiveDate),
        versionNumber: procedure.versionNumber,
        startDate: toDateInputValue(procedure.startDate),
        endDate: toDateInputValue(procedure.endDate),
        deadline: toDateInputValue(procedure.deadline),
        showInCalendar: procedure.showInCalendar ?? false,
        eventType: procedure.eventType ?? "",
        targetAudience: procedure.targetAudience ?? [ProcedureAudience.STUDENT, ProcedureAudience.EMPLOYEE],
      });
    } else if (open) {
      setForm((f) => ({ ...f, title: "", description: "", keywords: "", requiredDocuments: "", steps: "", targetAudience: [ProcedureAudience.STUDENT, ProcedureAudience.EMPLOYEE] }));
      setAttachment(null);
      setAttachmentError(null);
    }
  }, [procedure, open]);

  const isSaving = createProcedure.isPending || updateProcedure.isPending || isUploadingAttachment;
  const saveError = attachmentError ?? (createProcedure.error ?? updateProcedure.error);

  function closeModal() {
    createProcedure.reset();
    updateProcedure.reset();
    setAttachment(null);
    setAttachmentError(null);
    onClose();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setAttachmentError(null);

    const payload = {
      title: form.title,
      description: form.description,
      department: form.department,
      category: form.category,
      keywords: form.keywords.split(",").map((k) => k.trim()).filter(Boolean),
      requiredDocuments: form.requiredDocuments.split(",").map((d) => d.trim()).filter(Boolean),
      steps: form.steps
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((description, index) => ({ order: index + 1, description })),
      responsiblePerson: form.responsiblePerson,
      effectiveDate: form.effectiveDate,
      versionNumber: form.versionNumber,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
      deadline: form.deadline || undefined,
      showInCalendar: form.showInCalendar,
      eventType: form.eventType || undefined,
      targetAudience: form.targetAudience,
    };

    try {
      if (procedure) {
        await updateProcedure.mutateAsync({ id: procedure._id, data: payload });
        closeModal();
        return;
      }

      const createdProcedure = await createProcedure.mutateAsync(payload);
      if (attachment) {
        try {
          setIsUploadingAttachment(true);
          await documentsApi.upload(createdProcedure._id, attachment);
        } catch {
          setAttachmentError(`La procédure a été créée, mais le document « ${attachment.name} » n'a pas pu être envoyé. Vous pouvez l'ajouter depuis Attachments.`);
          return;
        } finally {
          setIsUploadingAttachment(false);
        }
      }
      closeModal();
    } catch {
      // React Query keeps the API error used by saveError above.
    }
  }

  return (
    <Modal open={open} onClose={closeModal} title={procedure ? "Edit Procedure" : "New Procedure"} widthClassName="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextInput
          label="Title"
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <TextArea
          label="Description"
          required
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <div>
          <Select
            label="Department"
            required
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
          >
            <option value="">Select department</option>
            {departments?.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </Select>
          <Select
            label="Category"
            required
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            <option value="">Select category</option>
            {categories?.map((c) => (
              <option key={c._id} value={c._id}>
                {c.group} — {c.name}
              </option>
            ))}
          </Select>
        </div>

        <TextInput
          label="Keywords (comma separated)"
          value={form.keywords}
          onChange={(e) => setForm({ ...form, keywords: e.target.value })}
        />
        <TextInput
          label="Required Documents (comma separated)"
          value={form.requiredDocuments}
          onChange={(e) => setForm({ ...form, requiredDocuments: e.target.value })}
        />
        <TextArea
          label="Steps (one per line)"
          value={form.steps}
          onChange={(e) => setForm({ ...form, steps: e.target.value })}
        />

        <fieldset className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
          <legend className="px-1 text-sm font-semibold text-secondary dark:text-white">Target audience</legend>
          <p className="mt-1 text-xs text-slate-500">Determines which user workspace can access this published procedure.</p>
          <div className="mt-3 flex flex-wrap gap-4">
            {([
              [ProcedureAudience.STUDENT, "Students"],
              [ProcedureAudience.EMPLOYEE, "Employees"],
            ] as const).map(([audience, label]) => (
              <label key={audience} className="flex items-center gap-2 text-sm font-medium text-secondary dark:text-white">
                <input
                  type="checkbox"
                  checked={form.targetAudience.includes(audience)}
                  onChange={(event) => {
                    const targetAudience = event.target.checked
                      ? [...form.targetAudience, audience]
                      : form.targetAudience.filter((item) => item !== audience);
                    if (targetAudience.length) setForm({ ...form, targetAudience });
                  }}
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        {!procedure && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
            <label htmlFor="procedure-attachment" className="block text-sm font-medium text-secondary dark:text-white">Document à joindre</label>
            <p className="mt-1 text-xs text-slate-500">Optionnel — PDF, Word, Excel ou image (20 Mo maximum). Il sera affiché dans Attachments après la création.</p>
            <input
              id="procedure-attachment"
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,image/png,image/jpeg,image/gif,image/webp"
              className="mt-3 block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-primary-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-primary hover:file:bg-primary-100 dark:text-slate-300 dark:file:bg-primary/15"
              onChange={(event) => setAttachment(event.target.files?.[0] ?? null)}
            />
            {attachment && <p className="mt-2 text-xs font-medium text-primary">Fichier sélectionné : {attachment.name}</p>}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <TextInput
            label="Responsible Person"
            required
            value={form.responsiblePerson}
            onChange={(e) => setForm({ ...form, responsiblePerson: e.target.value })}
          />
          <TextInput
            label="Effective Date"
            type="date"
            required
            value={form.effectiveDate}
            onChange={(e) => setForm({ ...form, effectiveDate: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <TextInput
            label="Version Number"
            required
            value={form.versionNumber}
            onChange={(e) => setForm({ ...form, versionNumber: e.target.value })}
          />
        </div>

        <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
          <label className="flex items-center gap-2 text-sm font-medium text-secondary dark:text-white"><input type="checkbox" checked={form.showInCalendar} onChange={(e) => setForm({ ...form, showInCalendar: e.target.checked })} /> Show in institutional calendar</label>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <TextInput label="Start date" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            <TextInput label="End date" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            <TextInput label="Deadline" type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
            <TextInput label="Event type" placeholder="e.g. Registration" value={form.eventType} onChange={(e) => setForm({ ...form, eventType: e.target.value })} />
          </div>
        </div>

        {saveError && (
          <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
            {typeof saveError === "string" ? saveError : saveErrorMessage(saveError)}
          </p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={closeModal}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (isUploadingAttachment ? "Uploading document…" : "Saving…") : procedure ? "Save Changes" : "Create Procedure"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
