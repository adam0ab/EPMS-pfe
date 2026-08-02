import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { studentCalendarService } from "../services/studentCalendar.service";

export const studentCalendarController = {
  list: asyncHandler(async (req: Request, res: Response) => res.json(await studentCalendarService.list(req.user!.sub))),
  add: asyncHandler(async (req: Request, res: Response) => res.status(201).json(await studentCalendarService.add(req.user!.sub, req.params.procedureId))),
  remove: asyncHandler(async (req: Request, res: Response) => {
    await studentCalendarService.remove(req.user!.sub, req.params.procedureId);
    res.status(204).send();
  }),
};
