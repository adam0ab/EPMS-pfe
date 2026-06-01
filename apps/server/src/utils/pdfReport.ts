import PDFDocument from "pdfkit";
import { ReportTable } from "../services/report.service";

const ESPRIT_RED = "#E30613";
const SLATE = "#1E293B";
const ROW_HEIGHT = 24;
const START_X = 50;

export function renderPdfReport(table: ReportTable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fillColor(ESPRIT_RED).fontSize(18).font("Helvetica-Bold").text("ESPRIT Procedure Management System");
    doc.fillColor(SLATE).fontSize(14).font("Helvetica-Bold").text(table.title, { paragraphGap: 4 });
    doc.fillColor("#64748b").fontSize(9).font("Helvetica").text(`Generated ${new Date().toLocaleString()}`);
    doc.moveDown(1.2);

    let y = doc.y;
    let x = START_X;

    doc.font("Helvetica-Bold").fontSize(10);
    doc.rect(START_X, y, table.columns.reduce((sum, c) => sum + (c.width ?? 120), 0), ROW_HEIGHT).fill(SLATE);
    doc.fillColor("#FFFFFF");
    for (const col of table.columns) {
      doc.text(col.header, x + 6, y + 7, { width: (col.width ?? 120) - 12 });
      x += col.width ?? 120;
    }
    y += ROW_HEIGHT;

    doc.font("Helvetica").fontSize(10);
    table.rows.forEach((row, index) => {
      if (y > 760) {
        doc.addPage();
        y = 50;
      }

      if (index % 2 === 0) {
        doc
          .rect(START_X, y, table.columns.reduce((sum, c) => sum + (c.width ?? 120), 0), ROW_HEIGHT)
          .fill("#F8FAFC");
      }

      doc.fillColor(SLATE);
      x = START_X;
      for (const col of table.columns) {
        doc.text(String(row[col.key] ?? ""), x + 6, y + 7, { width: (col.width ?? 120) - 12 });
        x += col.width ?? 120;
      }
      y += ROW_HEIGHT;
    });

    if (table.rows.length === 0) {
      doc.fillColor("#94a3b8").text("No data available.", START_X, y + 6);
    }

    doc.end();
  });
}
