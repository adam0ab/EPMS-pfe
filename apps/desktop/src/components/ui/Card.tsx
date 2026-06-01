import { HTMLAttributes } from "react";
import clsx from "clsx";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "rounded-xl border border-slate-200/70 bg-surface-card shadow-card",
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
}: {
  label: string;
  value: string | number;
  accent?: "primary" | "success" | "warning" | "danger" | "secondary";
  icon?: React.ReactNode;
}) {
  const accentClasses: Record<string, string> = {
    primary: "bg-primary-50 text-primary dark:bg-primary/10",
    success: "bg-green-50 text-success dark:bg-green-500/10",
    warning: "bg-amber-50 text-warning dark:bg-amber-500/10",
    danger: "bg-red-50 text-danger dark:bg-red-500/10",
    secondary: "bg-slate-100 text-secondary dark:bg-slate-700/40 dark:text-slate-200",
  };

  return (
    <Card className="flex items-center justify-between p-5">
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
