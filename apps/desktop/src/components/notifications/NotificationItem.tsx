import clsx from "clsx";
import { NotificationDTO, NotificationType } from "@epms/shared";

export const notificationMetadata: Record<NotificationType, { label: string; icon: string; className: string; action: string; important?: boolean }> = {
  [NotificationType.PROCEDURE_SUBMITTED_FOR_REVIEW]: { label: "Pending review", icon: "↗", action: "Review procedure", important: true, className: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300" },
  [NotificationType.PROCEDURE_APPROVED]: { label: "Approved", icon: "✓", action: "View procedure", className: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300" },
  [NotificationType.PROCEDURE_REJECTED]: { label: "Rejected", icon: "×", action: "View details", important: true, className: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300" },
  [NotificationType.PROCEDURE_PUBLISHED]: { label: "Published", icon: "↑", action: "View procedure", className: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300" },
  [NotificationType.PROCEDURE_UPDATED]: { label: "Updated", icon: "↻", action: "View procedure", className: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300" },
  [NotificationType.PROCEDURE_ARCHIVED]: { label: "Archived", icon: "□", action: "View procedure", className: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300" },
};

export function relativeTime(value: string) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86_400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 172_800) return "Yesterday";
  if (seconds < 604_800) return `${Math.floor(seconds / 86_400)}d ago`;
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function notificationGroup(value: string) {
  const date = new Date(value);
  const today = new Date();
  const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const startYesterday = startToday - 86_400_000;
  if (date.getTime() >= startToday) return "Today";
  if (date.getTime() >= startYesterday) return "Yesterday";
  return "Older";
}

/** Accept both the documented string id and populated MongoDB references. */
export function notificationProcedureId(procedure: unknown): string | undefined {
  if (typeof procedure === "string") return procedure;
  if (procedure && typeof procedure === "object" && "_id" in procedure) {
    const id = (procedure as { _id?: unknown })._id;
    return typeof id === "string" ? id : id ? String(id) : undefined;
  }
  return undefined;
}

export function NotificationItem({ notification, onSelect, compact = false }: { notification: NotificationDTO; onSelect: (notification: NotificationDTO) => void; compact?: boolean }) {
  const type = notificationMetadata[notification.type];
  return <button onClick={() => onSelect(notification)} className={clsx("flex w-full gap-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50", compact ? "px-4 py-3" : "rounded-xl px-4 py-4", !notification.isRead && "bg-primary-50/60 dark:bg-primary/5")}>
    <span aria-label={type.label} title={type.label} className={clsx("flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base font-bold", type.className)}>{type.icon}</span>
    <span className="min-w-0 flex-1"><span className="flex items-start justify-between gap-3"><span className="font-medium text-secondary dark:text-white">{type.label}</span><span className="shrink-0 text-xs text-slate-400">{relativeTime(notification.createdAt)}</span></span><span className="mt-1 block text-sm text-slate-500 dark:text-slate-400">{notification.message}</span></span>
    {!notification.isRead && <span aria-label="Unread" className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />}
  </button>;
}
