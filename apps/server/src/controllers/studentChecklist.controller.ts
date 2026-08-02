import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { studentChecklistService } from "../services/studentChecklist.service";

export const studentChecklistController = {
  list: asyncHandler(async (req: Request, res: Response) => res.json(await studentChecklistService.list(req.user!.sub))),
  attention: asyncHandler(async (req: Request, res: Response) => res.json(await studentChecklistService.attention(req.user!.sub))),
  add: asyncHandler(async (req: Request, res: Response) => res.status(201).json(await studentChecklistService.add(req.user!.sub, req.params.procedureId))),
  setStepCompletion: asyncHandler(async (req: Request, res: Response) => {
    res.json(await studentChecklistService.setStepCompletion(req.user!.sub, req.params.procedureId, Number(req.params.stepOrder), Boolean(req.body.completed)));
  }),
};
