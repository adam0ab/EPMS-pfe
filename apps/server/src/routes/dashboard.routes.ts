import { Router } from "express";
import { dashboardController } from "../controllers/dashboard.controller";
import { authenticate } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/rbac.middleware";
import { Role } from "@epms/shared";

export const dashboardRouter = Router();

dashboardRouter.use(authenticate);
dashboardRouter.get("/stats", requireRole(Role.SUPER_ADMIN, Role.EMPLOYEE), dashboardController.getStats);
dashboardRouter.get("/validator", requireRole(Role.VALIDATOR), dashboardController.getValidatorStats);
dashboardRouter.get("/admin", requireRole(Role.SUPER_ADMIN), dashboardController.getAdminStats);
dashboardRouter.get("/workflow-activity", requireRole(Role.SUPER_ADMIN), dashboardController.getWorkflowActivity);
dashboardRouter.get("/attention", requireRole(Role.SUPER_ADMIN), dashboardController.getProceduresRequiringAttention);
dashboardRouter.get("/health", requireRole(Role.SUPER_ADMIN), dashboardController.getHealth);
