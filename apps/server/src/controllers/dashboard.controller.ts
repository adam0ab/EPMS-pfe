import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { dashboardService } from "../services/dashboard.service";

export const dashboardController = {
  getStats: asyncHandler(async (_req: Request, res: Response) => {
    res.json(await dashboardService.getStats());
  }),
  getValidatorStats: asyncHandler(async (req: Request, res: Response) => {
    res.json(await dashboardService.getValidatorStats(req.user!.sub));
  }),
  getAdminStats: asyncHandler(async (_req: Request, res: Response) => {
    res.json(await dashboardService.getAdminStats());
  }),
  getWorkflowActivity: asyncHandler(async (req: Request, res: Response) => {
    const period = (req.query.period as string) ?? "30d";
    res.json(await dashboardService.getWorkflowActivity(period));
  }),
  getProceduresRequiringAttention: asyncHandler(async (_req: Request, res: Response) => {
    res.json(await dashboardService.getProceduresRequiringAttention());
  }),
  getHealth: asyncHandler(async (_req: Request, res: Response) => {
    res.json(await dashboardService.getHealth());
  }),
};
