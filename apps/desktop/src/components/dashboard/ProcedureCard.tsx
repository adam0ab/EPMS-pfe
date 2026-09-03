import { useNavigate } from "react-router-dom";
import { ProcedureDTO } from "@epms/shared";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { StatusBadge } from "../ui/Badge";
import clsx from "clsx";

export function ProcedureCard({ procedure, subtitle, onClick }: { procedure: ProcedureDTO; subtitle?: string; onClick?: () => void }) {
  const navigate = useNavigate();
  const department = typeof procedure.department === "object" ? procedure.department.name : "";
  const category = typeof procedure.category === "object" ? procedure.category.name : "";
  return <Card className={clsx("flex min-h-48 flex-col p-5", onClick && "cursor-pointer transition hover:shadow-md")} onClick={onClick}><div className="flex items-start justify-between gap-3"><h3 className="font-semibold text-secondary dark:text-white">{procedure.title}</h3><StatusBadge status={procedure.status} /></div><p className="mt-2 text-sm text-slate-500">{subtitle ?? [department, category].filter(Boolean).join(" · ")}</p><p className="mt-3 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">{procedure.description}</p><div className="mt-auto pt-4"><Button size="sm" onClick={(event) => { event.stopPropagation(); navigate(`/procedures/${procedure._id}/workflow`); }}>Procedure 360</Button></div></Card>;
}
