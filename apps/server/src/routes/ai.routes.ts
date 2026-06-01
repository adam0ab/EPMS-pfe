import { Router } from "express";
import { aiController } from "../controllers/ai.controller";
import { authenticate } from "../middleware/auth.middleware";

export const aiRouter = Router();

aiRouter.use(authenticate);
aiRouter.get("/status", aiController.status);
aiRouter.post("/ask", aiController.ask);
aiRouter.post("/summarize/:procedureId", aiController.summarize);
