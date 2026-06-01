import { useState } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { ReportFormat, ReportType, reportsApi } from "../../api/reports.api";

const REPORTS: { type: ReportType; title: string; description: string }[] = [
  {
    type: "by-department",
    title: "Procedures by Department",
    description: "Total procedure count for each institutional department.",
  },
  {
    type: "by-category",
    title: "Procedures by Category",
    description: "Procedure counts broken down by category and category group.",
  },
  {
    type: "most-viewed",
    title: "Most Viewed Procedures",
    description: "The 10 published procedures with the highest view counts.",
  },
  {
    type: "monthly-activity",
    title: "Monthly Activity",
    description: "Procedures created per month over the last 6 months.",
  },
];

export default function ReportsPage() {
  const [pending, setPending] = useState<string | null>(null);

  async function handleDownload(type: ReportType, format: ReportFormat) {
    const key = `${type}-${format}`;
    setPending(key);
    try {
      await reportsApi.download(type, format);
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-secondary dark:text-white">Reports</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Generate and download institutional procedure reports as PDF or Excel.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {REPORTS.map((report) => (
          <Card key={report.type} className="flex flex-col justify-between p-5">
            <div>
              <h2 className="text-sm font-semibold text-secondary dark:text-white">{report.title}</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{report.description}</p>
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={pending === `${report.type}-pdf`}
                onClick={() => handleDownload(report.type, "pdf")}
              >
                {pending === `${report.type}-pdf` ? "Generating…" : "Download PDF"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={pending === `${report.type}-excel`}
                onClick={() => handleDownload(report.type, "excel")}
              >
                {pending === `${report.type}-excel` ? "Generating…" : "Download Excel"}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
