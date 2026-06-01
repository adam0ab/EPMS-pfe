import { FormEvent, useMemo, useState } from "react";
import { CATEGORY_GROUPS, CategoryDTO } from "@epms/shared";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "../../hooks/useCategories";
import { DataTable } from "../../components/ui/DataTable";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Select, TextInput } from "../../components/ui/Field";

export default function CategoryList() {
  const { data, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [editing, setEditing] = useState<CategoryDTO | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", group: "" });

  const groups = useMemo(() => {
    const fromData = (data ?? []).map((c) => c.group);
    return Array.from(new Set([...Object.keys(CATEGORY_GROUPS), ...fromData])).sort();
  }, [data]);

  function openCreate() {
    setEditing(null);
    setForm({ name: "", group: groups[0] ?? "" });
    setModalOpen(true);
  }

  function openEdit(category: CategoryDTO) {
    setEditing(category);
    setForm({ name: category.name, group: category.group });
    setModalOpen(true);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const onSuccess = () => setModalOpen(false);
    if (editing) {
      updateCategory.mutate({ id: editing._id, data: form }, { onSuccess });
    } else {
      createCategory.mutate(form, { onSuccess });
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary dark:text-white">Categories</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage procedure categories grouped by domain.
          </p>
        </div>
        <Button onClick={openCreate}>+ New Category</Button>
      </div>

      <DataTable
        rows={data ?? []}
        rowKey={(row) => row._id}
        isLoading={isLoading}
        columns={[
          { header: "Group", cell: (row) => row.group },
          { header: "Category", cell: (row) => <span className="font-medium">{row.name}</span> },
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
                    if (confirm(`Delete category "${row.name}"?`)) deleteCategory.mutate(row._id);
                  }}
                >
                  Delete
                </Button>
              </div>
            ),
          },
        ]}
      />

      <Modal open={isModalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Category" : "New Category"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select label="Group" required value={form.group} onChange={(e) => setForm({ ...form, group: e.target.value })}>
            {groups.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </Select>
          <TextInput
            label="Category Name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{editing ? "Save Changes" : "Create Category"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
