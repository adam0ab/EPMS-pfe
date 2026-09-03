import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProcedureDTO, ProcedureStatus, Role } from "@epms/shared";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Select } from "../components/ui/Field";
import { ProcedureFormModal } from "../components/procedures/ProcedureFormModal";
import { useCategories } from "../hooks/useCategories";
import { useDepartments } from "../hooks/useDepartments";
import { useProcedures } from "../hooks/useProcedures";
import { useAuthStore } from "../store/auth.store";
import { useAddToStudentCalendar, useRemoveFromStudentCalendar, useStudentCalendar } from "../hooks/useStudentCalendar";

type CalendarView = "month" | "week" | "day" | "list";
type CalendarEvent = { procedure: ProcedureDTO; date: Date; kind: "Deadline" | "Start" | "End" };
const views: CalendarView[] = ["month", "week", "day", "list"];

function localDate(value?: string) {
  if (!value) return undefined;
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  return new Date(year, month - 1, day, 12);
}
function dayKey(date: Date) { return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`; }
function displayDate(date: Date) { return date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }); }
function eventEntries(procedure: ProcedureDTO, personal = false): CalendarEvent[] {
  if (!personal && !procedure.showInCalendar) return [];
  return ([
    [procedure.deadline, "Deadline"], [procedure.startDate, "Start"], [procedure.endDate, "End"],
  ] as const).flatMap(([value, kind]) => { const date = localDate(value); return date ? [{ procedure, date, kind }] : []; });
}
function eventLabel(event: CalendarEvent) { return `${event.kind}: ${event.procedure.title}`; }

export default function ProcedureCalendar() {
  const navigate = useNavigate();
  const role = useAuthStore((s) => s.user?.role);
  const [view, setView] = useState<CalendarView>("month");
  const [cursor, setCursor] = useState(() => new Date());
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [isStudentPickerOpen, setStudentPickerOpen] = useState(false);
  const [department, setDepartment] = useState(""); const [category, setCategory] = useState(""); const [eventType, setEventType] = useState(""); const [status, setStatus] = useState("");
  const { data: departments = [] } = useDepartments(); const { data: categories = [] } = useCategories();
  const { data: personalCalendarProcedures = [] } = useStudentCalendar();
  const addToCalendar = useAddToStudentCalendar();
  const removeFromCalendar = useRemoveFromStudentCalendar();
  const { data, isLoading, isError } = useProcedures({ department, category, status, pageSize: 100 });
  const events = useMemo(() => {
    const institutional = (data?.items ?? []).flatMap((procedure) => eventEntries(procedure));
    const personal = personalCalendarProcedures.flatMap((procedure) => eventEntries(procedure, true));
    const unique = [...institutional, ...personal].filter((event, index, all) => all.findIndex((candidate) => candidate.procedure._id === event.procedure._id && candidate.kind === event.kind) === index);
    return unique.filter((event) => !eventType || event.procedure.eventType === eventType).sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [data?.items, eventType, personalCalendarProcedures]);
  const types = useMemo(() => [...new Set((data?.items ?? []).map((item) => item.eventType).filter(Boolean))] as string[], [data?.items]);
  const move = (amount: number) => setCursor((value) => { const next = new Date(value); if (view === "month") next.setMonth(next.getMonth() + amount); else next.setDate(next.getDate() + amount * (view === "week" ? 7 : 1)); return next; });
  const range = useMemo(() => { const start = new Date(cursor.getFullYear(), cursor.getMonth(), 1); if (view === "month") start.setDate(start.getDate() - start.getDay()); const end = new Date(start); end.setDate(start.getDate() + (view === "month" ? 42 : view === "week" ? 7 : 1)); return { start, end }; }, [cursor, view]);
  const visible = events.filter((event) => event.date >= range.start && event.date < range.end);
  const title = view === "month" ? cursor.toLocaleDateString("en-GB", { month: "long", year: "numeric" }) : `${displayDate(range.start)} – ${displayDate(new Date(range.end.getTime() - 86_400_000))}`;
  const openProcedure = (event: CalendarEvent) => navigate(`/procedures/${event.procedure._id}/workflow`);
  const dates = Array.from({ length: view === "month" ? 42 : view === "week" ? 7 : 1 }, (_, index) => { const date = new Date(range.start); date.setDate(range.start.getDate() + index); return date; });

  const selectableProcedures = (data?.items ?? []).filter((procedure) => procedure.deadline || procedure.startDate || procedure.endDate);
  return <div className="space-y-6"><header className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end"><div><p className="text-sm font-semibold text-primary">Institutional schedule</p><h1 className="mt-1 text-3xl font-bold text-secondary dark:text-white">Procedure calendar</h1><p className="mt-2 text-slate-500">Dated procedures visible to your current role.</p></div><div className="flex flex-wrap gap-2">{role === Role.SUPER_ADMIN && (<Button size="sm" variant="primary" onClick={() => setCreateOpen(true)}>+ Add to calendar</Button>)}{role === Role.STUDENT && <Button size="sm" variant="primary" onClick={() => setStudentPickerOpen((open) => !open)}>+ Add procedure</Button>}{views.map((item) => <Button key={item} size="sm" variant={view === item ? "primary" : "ghost"} onClick={() => setView(item)}>{item[0].toUpperCase() + item.slice(1)}</Button>)}</div></header>
    <Card className="p-4"><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Select label="Department" value={department} onChange={(e) => setDepartment(e.target.value)}><option value="">All departments</option>{departments.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</Select><Select label="Category" value={category} onChange={(e) => setCategory(e.target.value)}><option value="">All categories</option>{categories.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</Select><Select label="Event type" value={eventType} onChange={(e) => setEventType(e.target.value)}><option value="">All event types</option>{types.map((item) => <option key={item} value={item}>{item}</option>)}</Select><Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All visible statuses</option>{Object.values(ProcedureStatus).map((item) => <option key={item} value={item}>{item}</option>)}</Select></div></Card>
    {role === Role.STUDENT && isStudentPickerOpen && <Card className="overflow-hidden"><div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800"><div><h2 className="font-semibold text-secondary dark:text-white">Manage my calendar procedures</h2><p className="mt-1 text-sm text-slate-500">Choose a published procedure with a real date, or remove one from your calendar.</p></div><Button size="sm" variant="ghost" onClick={() => setStudentPickerOpen(false)}>Close</Button></div>{!selectableProcedures.length ? <p className="p-5 text-sm text-slate-500">No dated procedures are available.</p> : <div className="divide-y divide-slate-100 dark:divide-slate-800">{selectableProcedures.map((procedure) => { const added = personalCalendarProcedures.some((item) => item._id === procedure._id); const date = procedure.deadline ?? procedure.startDate ?? procedure.endDate; const pending = addToCalendar.isPending || removeFromCalendar.isPending; return <div key={procedure._id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium text-secondary dark:text-white">{procedure.title}</p><p className="mt-1 text-sm text-slate-500">{date ? displayDate(localDate(date)!) : ""}</p></div><Button size="sm" variant={added ? "ghost" : "primary"} className={added ? "text-danger" : undefined} disabled={pending} onClick={() => added ? removeFromCalendar.mutate(procedure._id) : addToCalendar.mutate(procedure._id)}>{added ? removeFromCalendar.isPending ? "Removing..." : "Remove" : addToCalendar.isPending ? "Adding..." : "Add"}</Button></div>; })}</div>}</Card>}
    <Card className="overflow-hidden"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4 dark:border-slate-700"><div className="flex gap-2"><Button size="sm" variant="ghost" onClick={() => move(-1)}>Previous</Button><Button size="sm" variant="ghost" onClick={() => setCursor(new Date())}>Today</Button><Button size="sm" variant="ghost" onClick={() => move(1)}>Next</Button></div><h2 className="font-semibold text-secondary dark:text-white">{title}</h2></div>{isLoading ? <div className="grid min-h-80 place-items-center text-sm text-slate-400">Loading calendar…</div> : isError ? <div role="alert" className="grid min-h-80 place-items-center text-sm text-red-600">Unable to load calendar events.</div> : view === "list" ? <EventList events={events} onOpen={openProcedure} /> : !events.length ? <div className="grid min-h-80 place-items-center px-6 text-center"><div><p className="font-medium text-secondary dark:text-white">No scheduled procedures</p><p className="mt-1 text-sm text-slate-500">Only procedures enabled for the calendar with a start date, end date or deadline appear here.</p></div></div> : <div className={view === "month" ? "grid grid-cols-7" : "grid grid-cols-1 sm:grid-cols-7"}>{view === "month" && ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <div key={day} className="border-b border-r border-slate-200 bg-slate-50 px-2 py-2 text-xs font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-800">{day}</div>)}{dates.map((date) => <DayCell key={dayKey(date)} date={date} month={view === "month"} events={visible.filter((event) => dayKey(event.date) === dayKey(date))} onOpen={openProcedure} />)}</div>}</Card>
    <ProcedureFormModal open={isCreateOpen} onClose={() => setCreateOpen(false)} />
  </div>;
}

function DayCell({ date, month, events, onOpen }: { date: Date; month: boolean; events: CalendarEvent[]; onOpen: (event: CalendarEvent) => void }) { return <div className={`min-h-28 border-b border-r border-slate-200 p-2 dark:border-slate-700 ${month && date.getMonth() !== new Date().getMonth() ? "bg-slate-50/60 dark:bg-slate-800/30" : ""}`}><p className="text-xs font-medium text-slate-400">{month ? date.getDate() : displayDate(date)}</p><div className="mt-1 space-y-1">{events.map((event, index) => <button key={`${event.procedure._id}-${event.kind}-${index}`} title={eventLabel(event)} onClick={() => onOpen(event)} className="block w-full truncate rounded bg-primary-50 px-1.5 py-1 text-left text-xs font-medium text-primary hover:bg-primary-100 dark:bg-primary/15">{event.kind}: {event.procedure.title}</button>)}</div></div>; }
function EventList({ events, onOpen }: { events: CalendarEvent[]; onOpen: (event: CalendarEvent) => void }) { return !events.length ? <div className="grid min-h-80 place-items-center text-sm text-slate-500">No scheduled procedures match these filters.</div> : <div className="divide-y divide-slate-100 dark:divide-slate-800">{events.map((event, index) => <button key={`${event.procedure._id}-${event.kind}-${index}`} onClick={() => onOpen(event)} className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50"><span className="w-28 shrink-0 text-sm text-slate-500">{displayDate(event.date)}</span><span className="min-w-0 flex-1"><span className="block truncate font-medium text-secondary dark:text-white">{event.procedure.title}</span><span className="text-xs text-slate-400">{event.procedure.eventType || "Procedure event"} · {event.kind}</span></span></button>)}</div>; }
