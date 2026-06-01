import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { dashboardService } from "../services/dashboard.service";

export const dashboardController = {
  getStats: asyncHandler(async (_req: Request, res: Response) => {
    res.json(await dashboardService.getStats());
  }),
};
