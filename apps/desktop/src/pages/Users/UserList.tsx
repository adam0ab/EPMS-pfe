import { FormEvent, useState } from "react";
import { Role, UserDTO } from "@epms/shared";
import { useCreateUser, useDeleteUser, useUpdateUser, useUsers } from "../../hooks/useUsers";
import { useDepartments } from "../../hooks/useDepartments";
import { DataTable } from "../../components/ui/DataTable";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Select, TextInput } from "../../components/ui/Field";
import { Badge } from "../../components/ui/Badge";

export default function UserList() {
  const { data, isLoading } = useUsers();
  const { data: departments } = useDepartments();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const [isModalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: Role.EMPLOYEE as Role,
    department: "",
  });

  function openCreate() {
    setForm({ fullName: "", email: "", password: "", role: Role.EMPLOYEE, department: "" });
    setModalOpen(true);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    createUser.mutate(
      { ...form, department: form.department || undefined },
      { onSuccess: () => setModalOpen(false) }
    );
  }

  function toggleActive(user: UserDTO) {
    updateUser.mutate({ id: user._id, data: { isActive: !user.isActive } });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary dark:text-white">Users</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage Super Admin, Employee, Student and Validator accounts.
          </p>
        </div>
        <Button onClick={openCreate}>+ New User</Button>
      </div>

      <DataTable
        rows={data ?? []}
        rowKey={(row) => row._id}
        isLoading={isLoading}
        columns={[
          { header: "Name", cell: (row) => <span className="font-medium">{row.fullName}</span> },
          { header: "Email", cell: (row) => row.email },
          { header: "Role", cell: (row) => <Badge>{row.role.replace("_", " ")}</Badge> },
          {
            header: "Status",
            cell: (row) => (
              <Badge className={row.isActive ? "bg-green-50 text-success dark:bg-green-500/10" : ""}>
                {row.isActive ? "Active" : "Disabled"}
              </Badge>
            ),
          },
          {
            header: "",
            cell: (row) => (
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => toggleActive(row)}>
                  {row.isActive ? "Disable" : "Enable"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-danger"
                  onClick={() => {
                    if (confirm(`Delete user "${row.fullName}"?`)) deleteUser.mutate(row._id);
                  }}
                >
                  Delete
                </Button>
              </div>
            ),
          },
        ]}
      />

      <Modal open={isModalOpen} onClose={() => setModalOpen(false)} title="New User">
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextInput
            label="Full Name"
            required
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />
          <TextInput
            label="Email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <TextInput
            label="Password"
            type="password"
            required
            minLength={8}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })}>
              <option value={Role.EMPLOYEE}>Employee</option>
              <option value={Role.STUDENT}>Student</option>
              <option value={Role.VALIDATOR}>Validator</option>
              <option value={Role.SUPER_ADMIN}>Super Admin</option>
            </Select>
            <Select
              label="Department"
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
            >
              <option value="">None</option>
              {departments?.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create User</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
