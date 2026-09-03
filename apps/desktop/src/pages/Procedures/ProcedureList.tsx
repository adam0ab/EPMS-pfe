import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ProcedureAudience, ProcedureDTO, ProcedureStatus, Role } from "@epms/shared";
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
import { ChecklistButton } from "../../components/procedures/ChecklistButton";
import { Card } from "../../components/ui/Card";
import { useStudentChecklists } from "../../hooks/useStudentChecklists";

export default function ProcedureList() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const role = useAuthStore((s) => s.user?.role);
  const [page, setPage] = useState(1);
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [studentSearch, setStudentSearch] = useState(() => params.get("search") ?? "");
  const [checklistFilter, setChecklistFilter] = useState("all");
  const [deadlineFilter, setDeadlineFilter] = useState("all");
  const [studentSort, setStudentSort] = useState("updated");

  const search = params.get("search") ?? "";
  const department = params.get("department") ?? "";
  const category = params.get("category") ?? "";
  const status = params.get("status") ?? "";
  const keyword = params.get("keyword") ?? "";
  const versionNumber = params.get("versionNumber") ?? "";
  const effectiveFrom = params.get("effectiveFrom") ?? "";
  const effectiveTo = params.get("effectiveTo") ?? "";
  const health = params.get("health") ?? "";

  const hasAdvancedFilters = Boolean(keyword || versionNumber || effectiveFrom || effectiveTo);

  useEffect(() => {
    if (role !== Role.SUPER_ADMIN || params.get("new") !== "1") return;
    setCreateOpen(true);
    const next = new URLSearchParams(params);
    next.delete("new");
    setParams(next, { replace: true });
  }, [params, role, setParams]);

  const { data: departments } = useDepartments();
  const { data: categories } = useCategories();
  const { data: checklists = [] } = useStudentChecklists();
  const { data, isLoading } = useProcedures({
    search,
    department,
    category,
    status,
    keyword,
    versionNumber,
    effectiveFrom,
    effectiveTo,
    health,
    page,
    pageSize: 10,
  });

  const rows: ProcedureDTO[] = useMemo(() => data?.items ?? [], [data]);
  const studentRows = useMemo(() => {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    const filtered = rows.filter((procedure) => {
      const checklist = checklists.find((item) => item.procedure._id === procedure._id);
      if (checklistFilter === "not-added" && checklist) return false;
      if (checklistFilter === "in-progress" && (!checklist || checklist.isComplete)) return false;
      if (checklistFilter === "completed" && !checklist?.isComplete) return false;
      if (deadlineFilter === "none" && procedure.deadline) return false;
      if (!procedure.deadline || deadlineFilter === "all") return true;
      const days = Math.ceil((new Date(procedure.deadline).getTime() - now) / day);
      if (deadlineFilter === "soon") return days >= 0 && days <= 7;
      if (deadlineFilter === "upcoming") return days >= 0;
      if (deadlineFilter === "passed") return days < 0;
      return true;
    });
    return filtered.sort((a, b) => {
      if (studentSort === "alphabetical") return a.title.localeCompare(b.title);
      if (studentSort === "category") return (typeof a.category === "object" ? a.category.name : "").localeCompare(typeof b.category === "object" ? b.category.name : "");
      if (studentSort === "deadline") return (a.deadline ? new Date(a.deadline).getTime() : Number.MAX_SAFE_INTEGER) - (b.deadline ? new Date(b.deadline).getTime() : Number.MAX_SAFE_INTEGER);
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [rows, checklists, checklistFilter, deadlineFilter, studentSort]);

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
    setPage(1);
  }

  // Keep the directory responsive while avoiding one API request for every
  // keystroke during fast typing.
  useEffect(() => {
    if (role !== Role.STUDENT || studentSearch.trim() === search) return;
    const timeout = window.setTimeout(() => updateParam("search", studentSearch.trim()), 250);
    return () => window.clearTimeout(timeout);
  }, [role, search, studentSearch]);

  if (role === Role.STUDENT) {
    const clearStudentFilters = () => {
      setStudentSearch(""); setChecklistFilter("all"); setDeadlineFilter("all"); setStudentSort("updated");
      const next = new URLSearchParams(params); ["search", "department", "category"].forEach((key) => next.delete(key)); setParams(next); setPage(1);
    };
    const deadlineText = (deadline?: string) => {
      if (!deadline) return "No deadline";
      const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
      if (days < 0) return `Deadline passed · ${new Date(deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`;
      if (days === 0) return "Due today";
      if (days <= 3) return `Due in ${days} days`;
      if (days <= 7) return `${days} days left`;
      return `Deadline · ${new Date(deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`;
    };
    return (
      <div className="mx-auto max-w-7xl space-y-6 page-enter">
        <header><p className="text-sm font-semibold text-primary">Student services</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-secondary dark:text-white">Procedures</h1><p className="mt-2 text-slate-500">Find the administrative procedure you need.</p></header>
        <div className="flex gap-2"><SearchBar aria-label="Search procedures" placeholder="Search procedures..." value={studentSearch} onChange={(event) => setStudentSearch(event.target.value)} />{studentSearch && <Button type="button" variant="ghost" onClick={() => { setStudentSearch(""); updateParam("search", ""); }}>Clear</Button>}</div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5"><Select label="" aria-label="Filter by category" value={category} onChange={(event) => updateParam("category", event.target.value)}><option value="">All categories</option>{categories?.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</Select><Select label="" aria-label="Filter by department" value={department} onChange={(event) => updateParam("department", event.target.value)}><option value="">All departments</option>{departments?.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</Select><Select label="" aria-label="Filter by checklist status" value={checklistFilter} onChange={(event) => setChecklistFilter(event.target.value)}><option value="all">All checklist states</option><option value="not-added">Not in checklist</option><option value="in-progress">In progress</option><option value="completed">Completed</option></Select><Select label="" aria-label="Filter by deadline" value={deadlineFilter} onChange={(event) => setDeadlineFilter(event.target.value)}><option value="all">All deadlines</option><option value="soon">Due within 7 days</option><option value="upcoming">Upcoming</option><option value="none">No deadline</option><option value="passed">Deadline passed</option></Select><Select label="" aria-label="Sort procedures" value={studentSort} onChange={(event) => setStudentSort(event.target.value)}><option value="updated">Recently updated</option><option value="deadline">Deadline soonest</option><option value="alphabetical">Alphabetical</option><option value="category">Category</option></Select></div>
        <p className="text-sm text-slate-500">Showing {studentRows.length} of {data?.total ?? 0} procedures available</p>
        {isLoading ? <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800">{[1, 2, 3, 4, 5, 6].map((item) => <div key={item} className="h-32 animate-pulse bg-slate-50/70 dark:bg-slate-900/50" />)}</div> : !studentRows.length ? <Card className="p-10 text-center"><h2 className="font-semibold text-secondary dark:text-white">No procedures found</h2><p className="mt-2 text-sm text-slate-500">Try adjusting your search or filters.</p><Button className="mt-5" variant="ghost" onClick={clearStudentFilters}>Clear filters</Button></Card> : <div className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">{studentRows.map((procedure) => {
          const checklist = checklists.find((item) => item.procedure._id === procedure._id);
          const categoryName = typeof procedure.category === "object" ? procedure.category?.name : undefined;
          const departmentName = typeof procedure.department === "object" ? procedure.department?.name : undefined;
          return <div key={procedure._id} role="link" tabIndex={0} onClick={() => navigate(`/procedures/${procedure._id}`)} onKeyDown={(event) => { if (event.key === "Enter") navigate(`/procedures/${procedure._id}`); }} className="group cursor-pointer px-5 py-5 transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40 dark:hover:bg-slate-800/40"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-semibold text-secondary dark:text-white">{procedure.title}</h2>{checklist?.isComplete && <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">Completed</span>}</div><p className="mt-1 line-clamp-2 max-w-3xl text-sm leading-6 text-slate-500">{procedure.description}</p><p className="mt-3 text-sm text-slate-500"><span className="font-medium text-slate-600 dark:text-slate-300">{departmentName ?? "Department not specified"}</span><span className="mx-2 text-slate-300 dark:text-slate-600">·</span>{categoryName ?? "Procedure"}{checklist && <><span className="mx-2 text-slate-300 dark:text-slate-600">·</span><span className="font-medium text-primary">{checklist.isComplete ? "Checklist completed" : `${checklist.completedCount}/${checklist.totalCount} tasks complete`}</span></>}</p></div><div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center lg:min-w-[270px] lg:justify-end"><p className={`text-sm font-medium ${procedure.deadline && new Date(procedure.deadline).getTime() - Date.now() <= 7 * 86400000 ? "text-amber-700 dark:text-amber-300" : "text-slate-500"}`}>{deadlineText(procedure.deadline)}</p><div className="flex flex-wrap gap-2" onClick={(event) => event.stopPropagation()}><Button size="sm" variant="ghost" onClick={() => navigate(`/procedures/${procedure._id}`)}>View</Button>{checklist && !checklist.isComplete ? <Button size="sm" onClick={() => navigate(`/my-checklist?procedure=${procedure._id}`)}>Continue</Button> : checklist?.isComplete ? null : <ChecklistButton procedureId={procedure._id} status={procedure.status} role={role} />}</div></div></div></div>;
        })}</div>}
        <div className="flex items-center justify-between text-sm text-slate-500"><span>Page {data?.page ?? 1} of {data?.totalPages ?? 1}</span><div className="flex gap-2"><Button size="sm" variant="ghost" disabled={page <= 1} onClick={() => setPage((item) => item - 1)}>Previous</Button><Button size="sm" variant="ghost" disabled={!data || page >= data.totalPages} onClick={() => setPage((item) => item + 1)}>Next</Button></div></div>
      </div>
    );
  }

  if (role === Role.EMPLOYEE) {
    return <div className="space-y-6 page-enter"><header><p className="text-sm font-semibold text-primary">Administrative reference</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-secondary dark:text-white">Procedures</h1><p className="mt-2 text-slate-500">Published procedures, operational information, and institutional reference material for your workspace.</p></header><div className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-3 dark:border-slate-800 dark:bg-slate-900"><SearchBar placeholder="Search procedures or keywords" defaultValue={search} onKeyDown={(event) => { if (event.key === "Enter") updateParam("search", (event.target as HTMLInputElement).value); }} /><Select label="" value={department} onChange={(event) => updateParam("department", event.target.value)}><option value="">All departments</option>{departments?.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</Select><Select label="" value={category} onChange={(event) => updateParam("category", event.target.value)}><option value="">All categories</option>{categories?.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</Select></div><DataTable rows={rows} rowKey={(row) => row._id} isLoading={isLoading} onRowClick={(row) => navigate(`/procedures/${row._id}/workflow`)} columns={[{ header: "Procedure", cell: (row) => <div><p className="font-medium text-secondary dark:text-white">{row.title}</p><p className="mt-1 line-clamp-2 max-w-xl text-sm text-slate-500">{row.description}</p></div> }, { header: "Department", cell: (row) => typeof row.department === "object" ? row.department?.name ?? "—" : "—" }, { header: "Category", cell: (row) => typeof row.category === "object" ? row.category?.name ?? "—" : "—" }, { header: "Deadline", cell: (row) => row.deadline ? new Date(row.deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "Not specified" }, { header: "Updated", cell: (row) => new Date(row.updatedAt).toLocaleDateString() }]} /><div className="flex items-center justify-between text-sm text-slate-500"><span>Page {data?.page ?? 1} of {data?.totalPages ?? 1} · {data?.total ?? 0} procedures</span><div className="flex gap-2"><Button size="sm" variant="ghost" disabled={page <= 1} onClick={() => setPage((item) => item - 1)}>Previous</Button><Button size="sm" variant="ghost" disabled={!data || page >= data.totalPages} onClick={() => setPage((item) => item + 1)}>Next</Button></div></div></div>;
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
          {(role === Role.SUPER_ADMIN
            ? Object.values(ProcedureStatus)
            : role === Role.VALIDATOR
              ? [ProcedureStatus.PENDING_REVIEW]
              : [ProcedureStatus.PUBLISHED]
          ).map((s) => (
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
          { header: "Title", cell: (row) => <div className="flex items-center gap-2"><span className="font-medium">{row.title}</span><button className="rounded px-2 py-1 text-xs font-medium text-primary hover:bg-primary-50 dark:hover:bg-primary/10" onClick={(event) => { event.stopPropagation(); navigate(`/procedures/${row._id}/workflow`); }}>Procedure 360</button></div> },
          {
            header: "Department",
            cell: (row) => (typeof row.department === "object" ? row.department?.name ?? "—" : "—"),
          },
          { header: "Category", cell: (row) => (typeof row.category === "object" ? row.category?.name ?? "—" : "—") },
          { header: "Version", cell: (row) => row.versionNumber },
          { header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
          ...(role === Role.SUPER_ADMIN
            ? [{
                header: "Audience",
                cell: (row: ProcedureDTO) => {
                  const audiences = row.targetAudience ?? [];
                  const label = audiences.length === 2
                    ? "Student + Employee"
                    : audiences.includes(ProcedureAudience.STUDENT)
                      ? "Student"
                      : "Employee";
                  return <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">{label}</span>;
                },
              }]
            : []),
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
