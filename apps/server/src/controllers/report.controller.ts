import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { reportService } from "../services/report.service";
import { renderPdfReport } from "../utils/pdfReport";
import { renderExcelReport } from "../utils/excelReport";
import { ApiError } from "../utils/ApiError";
import { ReportFilters } from "../services/report.service";

export const reportController = {
  generate: asyncHandler(async (req: Request, res: Response) => {
    const filters: ReportFilters = {
      dateFrom: req.query.dateFrom as string | undefined,
      dateTo: req.query.dateTo as string | undefined,
      status: req.query.status as string | undefined,
      department: req.query.department as string | undefined,
      category: req.query.category as string | undefined,
    };
    const report = await reportService.buildReport(filters);
    res.json(report);
  }),

  pdf: asyncHandler(async (req: Request, res: Response) => {
    const filters: ReportFilters = {
      dateFrom: req.query.dateFrom as string | undefined,
      dateTo: req.query.dateTo as string | undefined,
      status: req.query.status as string | undefined,
      department: req.query.department as string | undefined,
      category: req.query.category as string | undefined,
    };
    const report = await reportService.buildReport(filters);
    const buffer = await renderPdfReport(report);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="epms-report-${Date.now()}.pdf"`);
    res.send(buffer);
  }),

  excel: asyncHandler(async (req: Request, res: Response) => {
    const filters: ReportFilters = {
      dateFrom: req.query.dateFrom as string | undefined,
      dateTo: req.query.dateTo as string | undefined,
      status: req.query.status as string | undefined,
      department: req.query.department as string | undefined,
      category: req.query.category as string | undefined,
    };
    const report = await reportService.buildReport(filters);
    const buffer = await renderExcelReport(report);

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="epms-report-${Date.now()}.xlsx"`);
    res.send(buffer);
  }),
};
