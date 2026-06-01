import { FormEvent, useState } from "react";
import { DepartmentDTO } from "@epms/shared";
import {
  useCreateDepartment,
  useDeleteDepartment,
  useDepartments,
  useUpdateDepartment,
} from "../../hooks/useDepartments";
import { DataTable } from "../../components/ui/DataTable";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { TextArea, TextInput } from "../../components/ui/Field";

export default function DepartmentList() {
  const { data, isLoading } = useDepartments();
  const createDepartment = useCreateDepartment();
  const updateDepartment = useUpdateDepartment();
  const deleteDepartment = useDeleteDepartment();

  const [editing, setEditing] = useState<DepartmentDTO | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });

  function openCreate() {
    setEditing(null);
    setForm({ name: "", description: "" });
    setModalOpen(true);
  }

  function openEdit(department: DepartmentDTO) {
    setEditing(department);
    setForm({ name: department.name, description: department.description ?? "" });
    setModalOpen(true);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const onSuccess = () => setModalOpen(false);
    if (editing) {
      updateDepartment.mutate({ id: editing._id, data: form }, { onSuccess });
    } else {
      createDepartment.mutate(form, { onSuccess });
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary dark:text-white">Departments</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage the institutional departments procedures belong to.
          </p>
        </div>
        <Button onClick={openCreate}>+ New Department</Button>
      </div>

      <DataTable
        rows={data ?? []}
        rowKey={(row) => row._id}
        isLoading={isLoading}
        columns={[
          { header: "Name", cell: (row) => <span className="font-medium">{row.name}</span> },
          { header: "Description", cell: (row) => row.description || "—" },
          { header: "Procedures", cell: (row) => row.procedureCount ?? 0 },
          {
            header: "",
            cell: (row) => (
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => openEdit(row)}>
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-danger"
                  onClick={() => {
                    if (confirm(`Delete department "${row.name}"?`)) deleteDepartment.mutate(row._id);
                  }}
                >
                  Delete
                </Button>
              </div>
            ),
          },
        ]}
      />

      <Modal open={isModalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Department" : "New Department"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextInput
            label="Name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <TextArea
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{editing ? "Save Changes" : "Create Department"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
