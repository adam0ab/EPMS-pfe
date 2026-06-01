import { Router } from "express";
import { dashboardController } from "../controllers/dashboard.controller";
import { authenticate } from "../middleware/auth.middleware";

export const dashboardRouter = Router();

dashboardRouter.use(authenticate);
dashboardRouter.get("/stats", dashboardController.getStats);
