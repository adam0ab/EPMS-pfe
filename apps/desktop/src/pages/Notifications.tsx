import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NotificationDTO, NotificationType } from "@epms/shared";
import { NotificationFilters } from "../api/notifications.api";
import { Card, StatCard } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { NotificationItem, notificationGroup, notificationMetadata, notificationProcedureId, relativeTime } from "../components/notifications/NotificationItem";
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from "../hooks/useNotifications";

const groups = ["Today", "Yesterday", "Older"] as const;
const control = "rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-secondary dark:border-slate-700 dark:bg-slate-800 dark:text-white";

export default function Notifications() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<NotificationFilters>({ status: "all", date: "all", search: "" });
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<NotificationDTO | null>(null);
  const activeFilters = useMemo(() => ({ ...filters, search: filters.search?.trim() || undefined }), [filters]);
  const { data, isLoading, isError, refetch } = useNotifications(20, page, activeFilters);
  const markAsRead = useMarkNotificationRead();
  const markAllAsRead = useMarkAllNotificationsRead();

  useEffect(() => { const timer = window.setTimeout(() => setFilters((v) => ({ ...v, search })), 250); return () => window.clearTimeout(timer); }, [search]);
  const update = <K extends keyof NotificationFilters>(key: K, value: NotificationFilters[K]) => { setPage(1); setFilters((v) => ({ ...v, [key]: value })); };
  const select = (notification: NotificationDTO) => { setSelected(notification); if (!notification.isRead) markAsRead.mutate(notification._id); };
  const hasFilters = filters.status !== "all" || filters.type || filters.date !== "all" || filters.important || Boolean(filters.search);
  const meta = selected ? notificationMetadata[selected.type] : null;
  const selectedProcedureId = selected ? notificationProcedureId(selected.procedure) : undefined;
  const applyKpi = (next: NotificationFilters) => { setSearch(""); setPage(1); setFilters({ status: "all", date: "all", search: "", ...next }); };

  return <div className="mx-auto max-w-7xl space-y-6">
    <header className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end"><div><h1 className="text-3xl font-bold tracking-tight text-secondary dark:text-white">Notification Center</h1><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Stay informed about procedures, validations and important activities.</p></div><div className="flex items-center gap-3"><span className="rounded-lg bg-primary-50 px-3 py-2 text-sm font-semibold text-primary dark:bg-primary/10">{data?.unreadCount ?? 0} unread</span><Button size="sm" variant="ghost" onClick={() => refetch()}>Refresh</Button><Button size="sm" disabled={!data?.unreadCount || markAllAsRead.isPending} onClick={() => markAllAsRead.mutate()}>{markAllAsRead.isPending ? "Marking…" : "Mark all as read"}</Button></div></header>

    {isLoading ? <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">{[1, 2, 3, 4].map((n) => <div key={n} className="h-24 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />)}</div> : <div className="grid grid-cols-2 gap-3 xl:grid-cols-4"><StatCard label="Total" value={data?.summary.total ?? 0} accent="secondary" onClick={() => applyKpi({})} /><StatCard label="Unread" value={data?.summary.unread ?? 0} accent="primary" onClick={() => applyKpi({ status: "unread" })} /><StatCard label="Important" value={data?.summary.important ?? 0} accent="warning" onClick={() => applyKpi({ important: true })} /><StatCard label="Recent" value={data?.summary.recent ?? 0} accent="info" onClick={() => applyKpi({ date: "week" })} /></div>}

    <Card className="p-4"><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(220px,1.6fr)_repeat(3,minmax(130px,0.6fr))_auto]"><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search notifications" className={control} /><select aria-label="Notification status" value={filters.status} onChange={(e) => update("status", e.target.value as NotificationFilters["status"])} className={control}><option value="all">All statuses</option><option value="unread">Unread</option><option value="read">Read</option></select><select aria-label="Notification type" value={filters.type ?? ""} onChange={(e) => update("type", e.target.value || undefined)} className={control}><option value="">All types</option>{Object.values(NotificationType).map((type) => <option key={type} value={type}>{notificationMetadata[type].label}</option>)}</select><select aria-label="Notification date" value={filters.date} onChange={(e) => update("date", e.target.value as NotificationFilters["date"])} className={control}><option value="all">Any date</option><option value="today">Today</option><option value="week">Last 7 days</option></select>{hasFilters && <Button size="sm" variant="ghost" onClick={() => { setSearch(""); setFilters({ status: "all", date: "all", search: "" }); setPage(1); }}>Clear</Button>}</div><p className="mt-3 text-xs text-slate-400">Priority is not available in the current notification model. Important items use existing pending-review and rejected events.</p></Card>

    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.85fr)]"><Card className="min-h-[480px] overflow-hidden p-2">{isLoading && <div className="space-y-3 p-3">{[1, 2, 3, 4, 5].map((n) => <div key={n} className="h-20 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />)}</div>}{isError && <Empty title="Unable to load notifications." copy="Please check your connection and try again." action="Retry" onClick={() => refetch()} />}{!isLoading && !isError && !data?.items.length && <Empty title={hasFilters ? "No notifications match your current filters." : "You’re all caught up."} copy={hasFilters ? "Try adjusting your search or filters." : "New activity assigned to you will appear here."} />}{!isLoading && !isError && data?.items.length ? <div className="space-y-5 p-2">{groups.map((group) => { const items = data.items.filter((item) => notificationGroup(item.createdAt) === group); return items.length ? <section key={group}><h2 className="px-2 pb-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{group}</h2><div className="space-y-1">{items.map((item) => <NotificationItem key={item._id} notification={item} onSelect={select} />)}</div></section> : null; })}</div> : null}</Card>
      <Card className="min-h-[300px] p-5 xl:sticky xl:top-6 xl:h-fit">{selected && meta ? <div className="space-y-5"><div className="flex items-start gap-3"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold ${meta.className}`}>{meta.icon}</span><div><p className="font-semibold text-secondary dark:text-white">{meta.label}</p><p className="mt-1 text-sm text-slate-500">{relativeTime(selected.createdAt)}</p></div></div><Detail label="Message" value={selected.message} /><div className="grid grid-cols-2 gap-4"><Detail label="Status" value={selected.isRead ? "Read" : "Unread"} /><Detail label="Date" value={new Date(selected.createdAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })} /></div>{selectedProcedureId && <Button className="w-full" onClick={() => navigate(`/procedures/${selectedProcedureId}`)}>{meta.action}</Button>}</div> : <Empty title="Select a notification" copy="Its details and relevant action will appear here." />}</Card></div>
    {!isLoading && !isError && (data?.totalPages ?? 1) > 1 && <div className="flex items-center justify-between text-sm text-slate-500"><span>Page {data?.page} of {data?.totalPages}</span><div className="flex gap-2"><Button size="sm" variant="ghost" disabled={page === 1} onClick={() => setPage((v) => v - 1)}>Previous</Button><Button size="sm" variant="ghost" disabled={page >= (data?.totalPages ?? 1)} onClick={() => setPage((v) => v + 1)}>Next</Button></div></div>}
  </div>;
}

function Detail({ label, value }: { label: string; value: string }) { return <div><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 text-sm leading-6 text-secondary dark:text-slate-200">{value}</p></div>; }
function Empty({ title, copy, action, onClick }: { title: string; copy: string; action?: string; onClick?: () => void }) { return <div className="flex min-h-[240px] flex-col items-center justify-center px-6 text-center"><span className="text-2xl text-slate-300">◌</span><p className="mt-3 font-semibold text-secondary dark:text-white">{title}</p><p className="mt-1 text-sm text-slate-500">{copy}</p>{action && onClick && <Button className="mt-4" size="sm" onClick={onClick}>{action}</Button>}</div>; }
