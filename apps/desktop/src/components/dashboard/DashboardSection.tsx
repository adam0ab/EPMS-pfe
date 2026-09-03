import { ReactNode } from "react";

export function DashboardSection({ id, title, description, action, children }: { id?: string; title: string; description?: string; action?: ReactNode; children: ReactNode }) {
  return <section id={id}><div className="mb-3 flex items-end justify-between gap-4"><div><h2 className="text-lg font-semibold text-secondary dark:text-white">{title}</h2>{description && <p className="mt-1 text-sm text-slate-500">{description}</p>}</div>{action}</div>{children}</section>;
}
