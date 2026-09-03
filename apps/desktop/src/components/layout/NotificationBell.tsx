import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NotificationDTO } from "@epms/shared";
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from "../../hooks/useNotifications";
import { NotificationItem, notificationProcedureId } from "../notifications/NotificationItem";
import { BellIcon } from "./icons";

export function NotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { data, isLoading, isError } = useNotifications(8);
  const markAsRead = useMarkNotificationRead();
  const markAllAsRead = useMarkAllNotificationsRead();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(notification: NotificationDTO) {
    if (!notification.isRead) markAsRead.mutate(notification._id);
    setOpen(false);
    const procedureId = notificationProcedureId(notification.procedure);
    if (procedureId) navigate(`/procedures/${procedureId}`);
  }

  const unreadCount = data?.unreadCount ?? 0;
  return <div ref={containerRef} className="relative">
    <button onClick={() => setOpen((value) => !value)} className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700" aria-label="Notifications">
      <BellIcon className="h-5 w-5" />
      {unreadCount > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">{unreadCount > 9 ? "9+" : unreadCount}</span>}
    </button>
    {open && <div className="absolute right-0 z-50 mt-2 w-96 overflow-hidden rounded-xl border border-slate-200 bg-surface-card shadow-xl dark:border-surface-dark-border dark:bg-surface-dark-card">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-surface-dark-border"><h3 className="text-sm font-semibold text-secondary dark:text-white">Notifications</h3>{unreadCount > 0 && <button onClick={() => markAllAsRead.mutate()} className="text-xs font-medium text-primary hover:underline">Mark all as read</button>}</div>
      <div className="max-h-80 overflow-y-auto scrollbar-thin">
        {isLoading && <div className="space-y-2 p-4">{[1, 2, 3].map((item) => <div key={item} className="h-14 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />)}</div>}
        {isError && <p role="alert" className="px-4 py-6 text-center text-sm text-red-600 dark:text-red-300">Unable to load notifications.</p>}
        {!isLoading && !isError && !(data?.items ?? []).length && <p className="px-4 py-6 text-center text-sm text-slate-400">No notifications yet.</p>}
        {!isLoading && !isError && data?.items.map((notification) => <NotificationItem key={notification._id} notification={notification} onSelect={handleSelect} compact />)}
      </div>
      <button onClick={() => { setOpen(false); navigate("/notifications"); }} className="w-full border-t border-slate-100 px-4 py-3 text-center text-sm font-medium text-primary hover:bg-slate-50 dark:border-surface-dark-border dark:hover:bg-slate-800/40">View all notifications</button>
    </div>}
  </div>;
}
