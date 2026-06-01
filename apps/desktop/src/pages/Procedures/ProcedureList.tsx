import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ProcedureDTO, ProcedureStatus, Role } from "@epms/shared";
import { useProcedures } from "../../hooks/useProcedures";
import { useDepartments } from "../../hooks/useDepartments";
import { useCategories } from "../../hooks/useCategories";
import { useAuthStore } from "../../store/auth.store";
import { DataTable } from "../../components/ui/DataTable";
import { SearchBar } from "../../components/ui/SearchBar";
import { Select, TextInput } from "../../components/ui/Field";
import { Button } from "../../components/ui/Button";
import { StatusBadge } from "../../components/ui/Badge";
import { ProcedureFormModal } from "../../components/procedures/ProcedureFormModal";

export default function ProcedureList() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const role = useAuthStore((s) => s.user?.role);
  const [page, setPage] = useState(1);
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const search = params.get("search") ?? "";
  const department = params.get("department") ?? "";
  const category = params.get("category") ?? "";
  const status = params.get("status") ?? "";
  const keyword = params.get("keyword") ?? "";
  const versionNumber = params.get("versionNumber") ?? "";
  const effectiveFrom = params.get("effectiveFrom") ?? "";
  const effectiveTo = params.get("effectiveTo") ?? "";

  const hasAdvancedFilters = Boolean(keyword || versionNumber || effectiveFrom || effectiveTo);

  const { data: departments } = useDepartments();
  const { data: categories } = useCategories();
  const { data, isLoading } = useProcedures({
    search,
    department,
    category,
    status,
    keyword,
    versionNumber,
    effectiveFrom,
    effectiveTo,
    page,
    pageSize: 10,
  });

  const rows: ProcedureDTO[] = useMemo(() => data?.items ?? [], [data]);

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
    setPage(1);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary dark:text-white">Procedures</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Search, filter and manage institutional procedures.
          </p>
        </div>
        {role === Role.SUPER_ADMIN && (
          <Button onClick={() => setCreateOpen(true)}>+ New Procedure</Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <SearchBar
          placeholder="Search by title or keyword…"
          defaultValue={search}
          onKeyDown={(e) => {
            if (e.key === "Enter") updateParam("search", (e.target as HTMLInputElement).value);
          }}
        />
        <Select label="" value={department} onChange={(e) => updateParam("department", e.target.value)}>
          <option value="">All Departments</option>
          {departments?.map((d) => (
            <option key={d._id} value={d._id}>
              {d.name}
            </option>
          ))}
        </Select>
        <Select label="" value={category} onChange={(e) => updateParam("category", e.target.value)}>
          <option value="">All Categories</option>
          {categories?.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select label="" value={status} onChange={(e) => updateParam("status", e.target.value)}>
          <option value="">All Statuses</option>
          {Object.values(ProcedureStatus).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <button
          onClick={() => setShowAdvanced((v) => !v)}
          className="text-sm font-medium text-primary hover:underline"
        >
          {showAdvanced ? "Hide advanced filters" : "Advanced filters"}
          {hasAdvancedFilters && !showAdvanced && " (active)"}
        </button>
      </div>

      {showAdvanced && (
        <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200/70 bg-surface-card p-4 sm:grid-cols-4 dark:border-surface-dark-border dark:bg-surface-dark-card">
          <TextInput
            label="Keyword"
            placeholder="e.g. scholarship"
            defaultValue={keyword}
            onKeyDown={(e) => {
              if (e.key === "Enter") updateParam("keyword", (e.target as HTMLInputElement).value);
            }}
            onBlur={(e) => updateParam("keyword", e.target.value)}
          />
          <TextInput
            label="Version"
            placeholder="e.g. 2.0"
            defaultValue={versionNumber}
            onKeyDown={(e) => {
              if (e.key === "Enter") updateParam("versionNumber", (e.target as HTMLInputElement).value);
            }}
            onBlur={(e) => updateParam("versionNumber", e.target.value)}
          />
          <TextInput
            label="Effective From"
            type="date"
            value={effectiveFrom}
            onChange={(e) => updateParam("effectiveFrom", e.target.value)}
          />
          <TextInput
            label="Effective To"
            type="date"
            value={effectiveTo}
            onChange={(e) => updateParam("effectiveTo", e.target.value)}
          />
          {hasAdvancedFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="justify-self-start sm:col-span-4"
              onClick={() => {
                const next = new URLSearchParams(params);
                ["keyword", "versionNumber", "effectiveFrom", "effectiveTo"].forEach((k) => next.delete(k));
                setParams(next);
                setPage(1);
              }}
            >
              Clear advanced filters
            </Button>
          )}
        </div>
      )}

      <DataTable
        rows={rows}
        rowKey={(row) => row._id}
        isLoading={isLoading}
        onRowClick={(row) => navigate(`/procedures/${row._id}`)}
        columns={[
          { header: "Title", cell: (row) => <span className="font-medium">{row.title}</span> },
          {
            header: "Department",
            cell: (row) => (typeof row.department === "object" ? row.department.name : "—"),
          },
          { header: "Category", cell: (row) => (typeof row.category === "object" ? row.category.name : "—") },
          { header: "Version", cell: (row) => row.versionNumber },
          { header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
          { header: "Updated", cell: (row) => new Date(row.updatedAt).toLocaleDateString() },
        ]}
      />

      <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
        <span>
          Page {data?.page ?? 1} of {data?.totalPages ?? 1} &middot; {data?.total ?? 0} procedures
        </span>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={!data || page >= data.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      <ProcedureFormModal open={isCreateOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
