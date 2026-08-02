import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { aiService } from "../services/ai.service";

export const aiController = {
  status: asyncHandler(async (_req: Request, res: Response) => {
    res.json({ configured: aiService.isConfigured() });
  }),

  ask: asyncHandler(async (req: Request, res: Response) => {
    const { question, procedureId, conversationContext } = req.body;
    const result = await aiService.ask(question, procedureId, req.user!.role, conversationContext);
    res.json(result);
  }),

  summarize: asyncHandler(async (req: Request, res: Response) => {
    const summary = await aiService.summarize(req.params.procedureId, req.user!.role);
    res.json({ summary });
  }),
};
