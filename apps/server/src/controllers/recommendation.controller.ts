import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { recommendationService } from "../services/recommendation.service";

export const recommendationController = {
  mine: asyncHandler(async (req: Request, res: Response) => {
    res.json(await recommendationService.forStudent(req.user!.sub));
  }),
};
