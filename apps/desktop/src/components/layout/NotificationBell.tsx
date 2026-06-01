import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import { NotificationDTO, NotificationType } from "@epms/shared";
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from "../../hooks/useNotifications";
import { BellIcon } from "./icons";

const TYPE_LABEL: Record<NotificationType, string> = {
  [NotificationType.PROCEDURE_PUBLISHED]: "Published",
  [NotificationType.PROCEDURE_UPDATED]: "Updated",
  [NotificationType.PROCEDURE_ARCHIVED]: "Archived",
};

export function NotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { data } = useNotifications();
  const markAsRead = useMarkNotificationRead();
  const markAllAsRead = useMarkAllNotificationsRead();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(notification: NotificationDTO) {
    if (!notification.isRead) markAsRead.mutate(notification._id);
    setOpen(false);
    if (notification.procedure) navigate(`/procedures/${notification.procedure}`);
  }

  const unreadCount = data?.unreadCount ?? 0;

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
        aria-label="Notifications"
      >
        <BellIcon className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-slate-200 bg-surface-card shadow-xl dark:border-surface-dark-border dark:bg-surface-dark-card">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-surface-dark-border">
            <h3 className="text-sm font-semibold text-secondary dark:text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead.mutate()}
                className="text-xs font-medium text-primary hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto scrollbar-thin">
            {(data?.items ?? []).length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-slate-400">No notifications yet.</p>
            )}
            {data?.items.map((n) => (
              <button
                key={n._id}
                onClick={() => handleSelect(n)}
                className={clsx(
                  "block w-full border-b border-slate-50 px-4 py-3 text-left text-sm last:border-0 hover:bg-slate-50 dark:border-surface-dark-border dark:hover:bg-slate-800/40",
                  !n.isRead && "bg-primary-50/50 dark:bg-primary/5"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-secondary dark:text-white">{TYPE_LABEL[n.type]}</span>
                  {!n.isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
                </div>
                <p className="mt-0.5 text-slate-500 dark:text-slate-400">{n.message}</p>
                <p className="mt-1 text-xs text-slate-400">{new Date(n.createdAt).toLocaleString()}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
