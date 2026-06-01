import { FormEvent, useEffect, useState } from "react";
import { ProcedureDTO, ProcedureStatus } from "@epms/shared";
import { Modal } from "../ui/Modal";
import { Select, TextArea, TextInput } from "../ui/Field";
import { Button } from "../ui/Button";
import { useDepartments } from "../../hooks/useDepartments";
import { useCategories } from "../../hooks/useCategories";
import { useCreateProcedure, useUpdateProcedure } from "../../hooks/useProcedures";

interface ProcedureFormModalProps {
  open: boolean;
  onClose: () => void;
  procedure?: ProcedureDTO;
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
    status: ProcedureStatus.DRAFT as ProcedureStatus,
  });

  useEffect(() => {
    if (procedure) {
      setForm({
        title: procedure.title,
        description: procedure.description,
        department: typeof procedure.department === "object" ? procedure.department._id : procedure.department,
        category: typeof procedure.category === "object" ? procedure.category._id : procedure.category,
        keywords: procedure.keywords.join(", "),
        requiredDocuments: procedure.requiredDocuments.join(", "),
        steps: procedure.steps.map((s) => s.description).join("\n"),
        responsiblePerson: procedure.responsiblePerson,
        effectiveDate: toDateInputValue(procedure.effectiveDate),
        versionNumber: procedure.versionNumber,
        status: procedure.status,
      });
    } else if (open) {
      setForm((f) => ({ ...f, title: "", description: "", keywords: "", requiredDocuments: "", steps: "" }));
    }
  }, [procedure, open]);

  const isSaving = createProcedure.isPending || updateProcedure.isPending;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

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
      status: form.status,
    };

    const onSuccess = () => onClose();

    if (procedure) {
      updateProcedure.mutate({ id: procedure._id, data: payload }, { onSuccess });
    } else {
      createProcedure.mutate(payload, { onSuccess });
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={procedure ? "Edit Procedure" : "New Procedure"} widthClassName="max-w-2xl">
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

        <div className="grid grid-cols-2 gap-4">
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
          <Select
            label="Status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as ProcedureStatus })}
          >
            {Object.values(ProcedureStatus).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving…" : procedure ? "Save Changes" : "Create Procedure"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
