import ExcelJS from "exceljs";
import { FullReport } from "../services/report.service";

const ESPRIT_RED = "FF1E293B";
const LIGHT_SLATE = "FFF8FAFC";

export async function renderExcelReport(report: FullReport): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "EPMS";
  workbook.created = new Date();

  const summary = report.executiveSummary;
  const summarySheet = workbook.addWorksheet("Executive Summary");
  summarySheet.columns = [
    { header: "Metric", key: "metric", width: 30 },
    { header: "Value", key: "value", width: 20 },
  ];
  const summaryHeader = summarySheet.getRow(1);
  summaryHeader.font = { bold: true, color: { argb: "FFFFFFFF" } };
  summaryHeader.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: ESPRIT_RED } };
  });
  summarySheet.addRow({ metric: "Report Period", value: report.periodLabel });
  summarySheet.addRow({ metric: "Generated At", value: new Date(report.generatedAt).toLocaleString() });
  summarySheet.addRow({ metric: "Total Procedures", value: summary.totalProcedures });
  summarySheet.addRow({ metric: "Published Rate", value: `${summary.publishedRate.toFixed(1)}%` });
  summarySheet.addRow({ metric: "Approval Rate", value: `${summary.approvalRate.toFixed(1)}%` });
  summarySheet.addRow({ metric: "Rejection Rate", value: `${summary.rejectionRate.toFixed(1)}%` });
  summarySheet.addRow({ metric: "Validation Backlog", value: summary.validationBacklog });
  summarySheet.addRow({ metric: "Publication Backlog", value: summary.publicationBacklog });
  summarySheet.addRow({ metric: "At Risk Procedures", value: summary.atRiskProcedures });
  summarySheet.addRow({ metric: "Critical Procedures", value: summary.criticalProcedures });
  summarySheet.addRow({ metric: "Avg Validation Time (h)", value: summary.averageValidationTimeHours ?? "N/A" });
  summarySheet.addRow({ metric: "Avg Publication Time (h)", value: summary.averagePublicationTimeHours ?? "N/A" });

  const workflowSheet = workbook.addWorksheet("Workflow Analysis");
  workflowSheet.columns = [
    { header: "Status", key: "status", width: 20 },
    { header: "Count", key: "count", width: 15 },
  ];
  const workflowHeader = workflowSheet.getRow(1);
  workflowHeader.font = { bold: true, color: { argb: "FFFFFFFF" } };
  workflowHeader.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: ESPRIT_RED } };
  });
  Object.entries(report.workflowAnalysis.distribution).forEach(([status, count]) => {
    workflowSheet.addRow({ status, count });
  });
  workflowSheet.addRow({});
  workflowSheet.addRow({ status: "Submission Rate", count: `${report.workflowAnalysis.submissionRate.toFixed(1)}%` });
  workflowSheet.addRow({ status: "Approval Rate", count: `${report.workflowAnalysis.approvalRate.toFixed(1)}%` });
  workflowSheet.addRow({ status: "Rejection Rate", count: `${report.workflowAnalysis.rejectionRate.toFixed(1)}%` });
  workflowSheet.addRow({ status: "Publication Rate", count: `${report.workflowAnalysis.publicationRate.toFixed(1)}%` });

  const healthSheet = workbook.addWorksheet("Health Analysis");
  healthSheet.columns = [
    { header: "Category", key: "category", width: 20 },
    { header: "Count", key: "count", width: 15 },
    { header: "Percentage", key: "percentage", width: 15 },
  ];
  const healthHeader = healthSheet.getRow(1);
  healthHeader.font = { bold: true, color: { argb: "FFFFFFFF" } };
  healthHeader.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: ESPRIT_RED } };
  });
  const totalHealth = report.healthAnalysis.total || 1;
  healthSheet.addRow({ category: "Healthy", count: report.healthAnalysis.healthy, percentage: `${((report.healthAnalysis.healthy / totalHealth) * 100).toFixed(1)}%` });
  healthSheet.addRow({ category: "At Risk", count: report.healthAnalysis.atRisk, percentage: `${((report.healthAnalysis.atRisk / totalHealth) * 100).toFixed(1)}%` });
  healthSheet.addRow({ category: "Critical", count: report.healthAnalysis.critical, percentage: `${((report.healthAnalysis.critical / totalHealth) * 100).toFixed(1)}%` });
  healthSheet.addRow({ category: "Average Score", count: `${report.healthAnalysis.averageScore}/100`, percentage: "" });

  const validationSheet = workbook.addWorksheet("Validation Performance");
  validationSheet.columns = [
    { header: "Metric", key: "metric", width: 30 },
    { header: "Value", key: "value", width: 20 },
  ];
  const validationHeader = validationSheet.getRow(1);
  validationHeader.font = { bold: true, color: { argb: "FFFFFFFF" } };
  validationHeader.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: ESPRIT_RED } };
  });
  validationSheet.addRow({ metric: "Period", value: report.validationAnalysis.periodLabel });
  validationSheet.addRow({ metric: "Total Submitted", value: report.validationAnalysis.totalSubmitted });
  validationSheet.addRow({ metric: "Total Approved", value: report.validationAnalysis.totalApproved });
  validationSheet.addRow({ metric: "Total Rejected", value: report.validationAnalysis.totalRejected });
  validationSheet.addRow({ metric: "Approval Rate", value: `${report.validationAnalysis.approvalRate.toFixed(1)}%` });
  validationSheet.addRow({ metric: "Rejection Rate", value: `${report.validationAnalysis.rejectionRate.toFixed(1)}%` });
  validationSheet.addRow({ metric: "Avg Validation Time (h)", value: report.validationAnalysis.averageValidationTimeHours ?? "N/A" });
  validationSheet.addRow({ metric: "Fastest Validation (h)", value: report.validationAnalysis.fastestValidationHours ?? "N/A" });
  validationSheet.addRow({ metric: "Longest Validation (h)", value: report.validationAnalysis.longestValidationHours ?? "N/A" });

  const complianceSheet = workbook.addWorksheet("Compliance & Documentation");
  complianceSheet.columns = [
    { header: "Metric", key: "metric", width: 35 },
    { header: "Value", key: "value", width: 15 },
    { header: "Percentage", key: "percentage", width: 15 },
  ];
  const complianceHeader = complianceSheet.getRow(1);
  complianceHeader.font = { bold: true, color: { argb: "FFFFFFFF" } };
  complianceHeader.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: ESPRIT_RED } };
  });
  complianceSheet.addRow({ metric: "Total Procedures", value: report.complianceAnalysis.total, percentage: "100%" });
  complianceSheet.addRow({ metric: "With Documents", value: report.complianceAnalysis.withDocuments, percentage: `${report.complianceAnalysis.documentationCoverage.toFixed(1)}%` });
  complianceSheet.addRow({ metric: "Without Documents", value: report.complianceAnalysis.withoutDocuments, percentage: `${(100 - report.complianceAnalysis.documentationCoverage).toFixed(1)}%` });
  complianceSheet.addRow({ metric: "With Responsible Person", value: report.complianceAnalysis.withResponsiblePerson, percentage: `${report.complianceAnalysis.metadataCompleteness.toFixed(1)}%` });
  complianceSheet.addRow({ metric: "Without Responsible Person", value: report.complianceAnalysis.withoutResponsiblePerson });
  complianceSheet.addRow({ metric: "With Deadline", value: report.complianceAnalysis.withDeadline });
  complianceSheet.addRow({ metric: "Without Deadline", value: report.complianceAnalysis.withoutDeadline });

  const insightsSheet = workbook.addWorksheet("Insights");
  insightsSheet.columns = [
    { header: "Type", key: "type", width: 15 },
    { header: "Title", key: "title", width: 30 },
    { header: "Message", key: "message", width: 60 },
  ];
  const insightsHeader = insightsSheet.getRow(1);
  insightsHeader.font = { bold: true, color: { argb: "FFFFFFFF" } };
  insightsHeader.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: ESPRIT_RED } };
  });
  report.insights.forEach((insight) => {
    insightsSheet.addRow({ type: insight.type, title: insight.title, message: insight.message });
  });

  const decisionsSheet = workbook.addWorksheet("Decisions");
  decisionsSheet.columns = [
    { header: "Priority", key: "priority", width: 12 },
    { header: "Title", key: "title", width: 35 },
    { header: "Reason", key: "reason", width: 50 },
    { header: "Affected Count", key: "affectedCount", width: 15 },
    { header: "Suggested Action", key: "suggestedAction", width: 50 },
  ];
  const decisionsHeader = decisionsSheet.getRow(1);
  decisionsHeader.font = { bold: true, color: { argb: "FFFFFFFF" } };
  decisionsHeader.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: ESPRIT_RED } };
  });
  report.decisions.forEach((decision) => {
    decisionsSheet.addRow({ priority: decision.priority, title: decision.title, reason: decision.reason, affectedCount: decision.affectedCount, suggestedAction: decision.suggestedAction });
  });

  const conclusionSheet = workbook.addWorksheet("Conclusion");
  conclusionSheet.columns = [
    { header: "Field", key: "field", width: 25 },
    { header: "Value", key: "value", width: 60 },
  ];
  const conclusionHeader = conclusionSheet.getRow(1);
  conclusionHeader.font = { bold: true, color: { argb: "FFFFFFFF" } };
  conclusionHeader.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: ESPRIT_RED } };
  });
  conclusionSheet.addRow({ field: "Overall Status", value: report.conclusion.overallStatus });
  conclusionSheet.addRow({ field: "Main Strength", value: report.conclusion.mainStrength });
  conclusionSheet.addRow({ field: "Main Weakness", value: report.conclusion.mainWeakness });
  conclusionSheet.addRow({ field: "Main Risk", value: report.conclusion.mainRisk });
  conclusionSheet.addRow({ field: "Recommended Priority", value: report.conclusion.recommendedPriority });

  const methodologySheet = workbook.addWorksheet("Methodology");
  methodologySheet.columns = [
    { header: "Metric", key: "metric", width: 30 },
    { header: "Formula", key: "formula", width: 50 },
  ];
  const methodologyHeader = methodologySheet.getRow(1);
  methodologyHeader.font = { bold: true, color: { argb: "FFFFFFFF" } };
  methodologyHeader.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: ESPRIT_RED } };
  });
  methodologySheet.addRow({ metric: "Published Rate", formula: "Published / Total Procedures × 100" });
  methodologySheet.addRow({ metric: "Approval Rate", formula: "Approved / (Approved + Rejected) × 100" });
  methodologySheet.addRow({ metric: "Rejection Rate", formula: "Rejected / (Approved + Rejected) × 100" });
  methodologySheet.addRow({ metric: "Submission Rate", formula: "(Approved + Rejected) / Total Procedures × 100" });
  methodologySheet.addRow({ metric: "Publication Rate", formula: "Published / Approved × 100" });
  methodologySheet.addRow({ metric: "Average Validation Time", formula: "Mean of (approvedAt or rejectedAt) - submittedAt in hours" });
  methodologySheet.addRow({ metric: "Average Publication Time", formula: "Mean of publishedAt - approvedAt in hours" });
  methodologySheet.addRow({ metric: "Documentation Coverage", formula: "Procedures with documents / Total Procedures × 100" });
  methodologySheet.addRow({ metric: "Metadata Completeness", formula: "Procedures with documents + responsible + deadline / (Total × 3) × 100" });
  methodologySheet.addRow({ metric: "Health Score", formula: "100 - applicable penalties based on status, deadlines, and age" });

  Object.values(workbook.worksheets).forEach((sheet) => {
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      row.eachCell((cell) => {
        cell.border = { bottom: { style: "thin", color: { argb: "FFE2E8F0" } } };
      });
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
