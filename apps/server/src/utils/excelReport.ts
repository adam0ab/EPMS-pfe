import ExcelJS from "exceljs";
import { ReportTable } from "../services/report.service";

export async function renderExcelReport(table: ReportTable): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "EPMS";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(table.title.slice(0, 31));

  sheet.columns = table.columns.map((col) => ({ header: col.header, key: col.key, width: (col.width ?? 120) / 7 }));

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E293B" } };
  });

  table.rows.forEach((row) => sheet.addRow(row));

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    row.eachCell((cell) => {
      cell.border = { bottom: { style: "thin", color: { argb: "FFE2E8F0" } } };
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
