import { useNavigate } from "react-router-dom";
import type { ProcedureHealth as ProcedureHealthType } from "../../api/dashboard.api";
import { ProcedureStatus } from "@epms/shared";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";

function percentage(value: number, total: number) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

export function ProcedureHealth({ data }: { data: ProcedureHealthType | undefined }) {
  const navigate = useNavigate();
  if (!data) return null;

  const healthyPct = percentage(data.healthy, data.total);
  const atRiskPct = percentage(data.atRisk, data.total);
  const criticalPct = percentage(data.critical, data.total);

  const circumference = 2 * Math.PI * 54;
  const healthyOffset = circumference - (healthyPct / 100) * circumference;

  return (
    <Card className="p-5">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Quality</p>
        <h2 className="mt-1 text-lg font-semibold text-secondary dark:text-white">Procedure Health</h2>
      </div>

      <div className="flex flex-col items-center">
        <div className="relative">
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="#e2e8f0" strokeWidth="12" />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="#22c55e"
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={healthyOffset}
              strokeLinecap="round"
              transform="rotate(-90 60 60)"
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-secondary dark:text-white">{healthyPct}%</span>
            <span className="text-xs text-slate-500">Healthy</span>
          </div>
        </div>

        <div className="mt-4 w-full space-y-2">
          <button onClick={() => navigate(`/procedures?status=${ProcedureStatus.PUBLISHED}`)} className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span className="text-sm text-slate-600 dark:text-slate-300">Healthy</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-secondary dark:text-white">{data.healthy}</span>
              <span className="text-xs text-slate-400">({healthyPct}%)</span>
            </div>
          </button>
          <button onClick={() => navigate(`/procedures?health=at-risk`)} className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              <span className="text-sm text-slate-600 dark:text-slate-300">At Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-secondary dark:text-white">{data.atRisk}</span>
              <span className="text-xs text-slate-400">({atRiskPct}%)</span>
            </div>
          </button>
          <button onClick={() => navigate(`/procedures?health=critical`)} className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
              <span className="text-sm text-slate-600 dark:text-slate-300">Critical</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-secondary dark:text-white">{data.critical}</span>
              <span className="text-xs text-slate-400">({criticalPct}%)</span>
            </div>
          </button>
        </div>

        <div className="mt-4 w-full rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
          <p className="text-xs text-slate-500">
            {healthyPct >= 70
              ? `${data.healthy} procedures are healthy.`
              : `${data.critical} procedures require immediate attention.`}
          </p>
          {(data.atRisk > 0 || data.critical > 0) && (
            <p className="mt-1 text-xs text-slate-500">
              {data.atRisk + data.critical} procedures require attention.
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
