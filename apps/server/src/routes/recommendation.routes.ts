import { Router } from "express";
import { Role } from "@epms/shared";
import { authenticate } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/rbac.middleware";
import { recommendationController } from "../controllers/recommendation.controller";

export const recommendationRouter = Router();
recommendationRouter.use(authenticate, requireRole(Role.STUDENT));
recommendationRouter.get("/me", recommendationController.mine);
