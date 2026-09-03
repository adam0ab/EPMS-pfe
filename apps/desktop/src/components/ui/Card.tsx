import { HTMLAttributes } from "react";
import clsx from "clsx";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-slate-200/80 bg-surface-card shadow-card transition-shadow duration-200 hover:shadow-lg",
        "dark:border-surface-dark-border dark:bg-surface-dark-card",
        className
      )}
      {...props}
    />
  );
}

export function StatCard({
  label,
  value,
  accent = "primary",
  icon,
  onClick,
}: {
  label: string;
  value: string | number;
  accent?: "primary" | "success" | "warning" | "danger" | "secondary" | "info";
  icon?: React.ReactNode;
  onClick?: () => void;
}) {
  const accentClasses: Record<string, string> = {
    primary: "bg-primary-50 text-primary dark:bg-primary/10",
    success: "bg-green-50 text-success dark:bg-green-500/10",
    warning: "bg-amber-50 text-warning dark:bg-amber-500/10",
    danger: "bg-red-50 text-danger dark:bg-red-500/10",
    secondary: "bg-slate-100 text-secondary dark:bg-slate-700/40 dark:text-slate-200",
    info: "bg-blue-50 text-blue-700 dark:bg-blue-500/10",
  };

  return (
    <Card
      className={clsx("flex items-center justify-between p-5", onClick && "cursor-pointer transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40")}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onClick(); } } : undefined}
    >
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <p className="mt-1 text-2xl font-bold text-secondary dark:text-white">{value}</p>
      </div>
      {icon && (
        <div className={clsx("flex h-11 w-11 items-center justify-center rounded-lg", accentClasses[accent])}>
          {icon}
        </div>
      )}
    </Card>
  );
}
