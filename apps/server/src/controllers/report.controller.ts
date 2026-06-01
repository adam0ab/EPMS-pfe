import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { reportService, ReportType } from "../services/report.service";
import { renderPdfReport } from "../utils/pdfReport";
import { renderExcelReport } from "../utils/excelReport";
import { ApiError } from "../utils/ApiError";

const VALID_TYPES: ReportType[] = ["by-department", "by-category", "most-viewed", "monthly-activity"];

function assertValidType(type: string): ReportType {
  if (!VALID_TYPES.includes(type as ReportType)) {
    throw ApiError.badRequest(`Unknown report type: ${type}`);
  }
  return type as ReportType;
}

export const reportController = {
  pdf: asyncHandler(async (req: Request, res: Response) => {
    const type = assertValidType(req.params.type);
    const table = await reportService.build(type);
    const buffer = await renderPdfReport(table);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${type}.pdf"`);
    res.send(buffer);
  }),

  excel: asyncHandler(async (req: Request, res: Response) => {
    const type = assertValidType(req.params.type);
    const table = await reportService.build(type);
    const buffer = await renderExcelReport(table);

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${type}.xlsx"`);
    res.send(buffer);
  }),
};
