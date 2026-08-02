import PDFDocument from "pdfkit";
import { FullReport } from "../services/report.service";

const ESPRIT_RED = "#E30613";
const SLATE = "#1E293B";
const LIGHT_SLATE = "#F8FAFC";
const ROW_HEIGHT = 24;
const START_X = 50;
const PAGE_WIDTH = 595.28;
const MARGIN = 50;

function drawSectionTitle(doc: typeof PDFDocument, title: string) {
  doc.moveDown(1);
  doc.fillColor(ESPRIT_RED).fontSize(16).font("Helvetica-Bold").text(title);
  doc.moveDown(0.5);
}

function drawKpiRow(doc: typeof PDFDocument, items: Array<{ label: string; value: string }>) {
  const colWidth = (PAGE_WIDTH - 2 * MARGIN - 30) / items.length;
  let y = doc.y;
  items.forEach((item, index) => {
    const x = MARGIN + index * colWidth;
    doc.rect(x, y, colWidth - 10, 60).fill(LIGHT_SLATE);
    doc.fillColor(SLATE).fontSize(10).font("Helvetica-Bold").text(item.label, x + 8, y + 8, { width: colWidth - 26 });
    doc.fillColor(ESPRIT_RED).fontSize(18).font("Helvetica-Bold").text(item.value, x + 8, y + 28, { width: colWidth - 26 });
  });
  doc.y = y + 70;
}

function drawTable(doc: typeof PDFDocument, title: string, columns: { header: string; key: string }[], rows: Record<string, string | number>[]) {
  drawSectionTitle(doc, title);
  let y = doc.y;
  const colWidth = (PAGE_WIDTH - 2 * MARGIN) / columns.length;

  doc.font("Helvetica-Bold").fontSize(10);
  doc.rect(MARGIN, y, PAGE_WIDTH - 2 * MARGIN, ROW_HEIGHT).fill(SLATE);
  doc.fillColor("#FFFFFF");
  columns.forEach((col, index) => {
    doc.text(col.header, MARGIN + index * colWidth + 6, y + 7, { width: colWidth - 12 });
  });
  y += ROW_HEIGHT;

  doc.font("Helvetica").fontSize(10);
  rows.forEach((row, index) => {
    if (y > 760) {
      doc.addPage();
      y = MARGIN;
    }
    if (index % 2 === 0) {
      doc.rect(MARGIN, y, PAGE_WIDTH - 2 * MARGIN, ROW_HEIGHT).fill(LIGHT_SLATE);
    }
    doc.fillColor(SLATE);
    columns.forEach((col, index) => {
      doc.text(String(row[col.key] ?? ""), MARGIN + index * colWidth + 6, y + 7, { width: colWidth - 12 });
    });
    y += ROW_HEIGHT;
  });

  doc.y = y + 10;
}

export function renderPdfReport(report: FullReport): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: MARGIN, size: "A4" });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fillColor(ESPRIT_RED).fontSize(20).font("Helvetica-Bold").text("EPMS Administrative Analytics Report", { paragraphGap: 8 });
    doc.fillColor(SLATE).fontSize(12).font("Helvetica-Bold").text("Executive Summary", { paragraphGap: 4 });
    doc.fillColor("#64748b").fontSize(9).font("Helvetica").text(`Generated: ${new Date(report.generatedAt).toLocaleString()}  |  Period: ${report.periodLabel}`);
    doc.moveDown(1.2);

    const summary = report.executiveSummary;
    drawKpiRow(doc, [
      { label: "Total Procedures", value: String(summary.totalProcedures) },
      { label: "Published Rate", value: `${summary.publishedRate.toFixed(1)}%` },
      { label: "Approval Rate", value: `${summary.approvalRate.toFixed(1)}%` },
      { label: "Rejection Rate", value: `${summary.rejectionRate.toFixed(1)}%` },
    ]);
    doc.moveDown(0.5);
    drawKpiRow(doc, [
      { label: "Validation Backlog", value: String(summary.validationBacklog) },
      { label: "Publication Backlog", value: String(summary.publicationBacklog) },
      { label: "At Risk", value: String(summary.atRiskProcedures) },
      { label: "Critical", value: String(summary.criticalProcedures) },
    ]);

    drawSectionTitle(doc, "Workflow Analysis");
    const workflowRows = Object.entries(report.workflowAnalysis.distribution).map(([status, count]) => ({ Status: status, Count: count }));
    drawTable(doc, "Status Distribution", [{ header: "Status", key: "Status" }, { header: "Count", key: "Count" }], workflowRows);

    drawSectionTitle(doc, "Procedure Health");
    const healthRows = [
      { Status: "Healthy", Count: report.healthAnalysis.healthy },
      { Status: "At Risk", Count: report.healthAnalysis.atRisk },
      { Status: "Critical", Count: report.healthAnalysis.critical },
    ];
    drawTable(doc, "Health Distribution", [{ header: "Status", key: "Status" }, { header: "Count", key: "Count" }], healthRows);

    drawSectionTitle(doc, "Validation Performance");
    const validation = report.validationAnalysis;
    const validationRows = [
      { Metric: "Total Submitted", Value: String(validation.totalSubmitted) },
      { Metric: "Total Approved", Value: String(validation.totalApproved) },
      { Metric: "Total Rejected", Value: String(validation.totalRejected) },
      { Metric: "Approval Rate", Value: `${validation.approvalRate.toFixed(1)}%` },
      { Metric: "Rejection Rate", Value: `${validation.rejectionRate.toFixed(1)}%` },
      { Metric: "Avg Validation Time (h)", Value: validation.averageValidationTimeHours !== null ? String(validation.averageValidationTimeHours) : "N/A" },
    ];
    drawTable(doc, "Validation Metrics", [{ header: "Metric", key: "Metric" }, { header: "Value", key: "Value" }], validationRows);

    drawSectionTitle(doc, "Key Insights");
    report.insights.forEach((insight) => {
      doc.fillColor(SLATE).fontSize(11).font("Helvetica-Bold").text(`[${insight.type.toUpperCase()}] ${insight.title}`);
      doc.fillColor("#64748b").fontSize(10).font("Helvetica").text(insight.message, { paragraphGap: 6 });
      doc.moveDown(0.5);
    });

    drawSectionTitle(doc, "Recommended Decisions");
    report.decisions.forEach((decision) => {
      doc.fillColor(SLATE).fontSize(11).font("Helvetica-Bold").text(`[${decision.priority}] ${decision.title}`);
      doc.fillColor("#64748b").fontSize(10).font("Helvetica").text(`Reason: ${decision.reason}`, { paragraphGap: 2 });
      doc.fillColor("#64748b").fontSize(10).font("Helvetica").text(`Action: ${decision.suggestedAction}`, { paragraphGap: 6 });
      doc.moveDown(0.5);
    });

    drawSectionTitle(doc, "Executive Conclusion");
    const conclusion = report.conclusion;
    doc.fillColor(SLATE).fontSize(12).font("Helvetica-Bold").text(`Overall Status: ${conclusion.overallStatus}`);
    doc.fillColor("#64748b").fontSize(10).font("Helvetica").text(`Main Strength: ${conclusion.mainStrength}`, { paragraphGap: 4 });
    doc.fillColor("#64748b").fontSize(10).font("Helvetica").text(`Main Weakness: ${conclusion.mainWeakness}`, { paragraphGap: 4 });
    doc.fillColor("#64748b").fontSize(10).font("Helvetica").text(`Main Risk: ${conclusion.mainRisk}`, { paragraphGap: 4 });
    doc.fillColor("#64748b").fontSize(10).font("Helvetica").text(`Recommended Priority: ${conclusion.recommendedPriority}`, { paragraphGap: 6 });

    doc.end();
  });
}
