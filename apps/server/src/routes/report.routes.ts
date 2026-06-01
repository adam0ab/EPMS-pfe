import { Router } from "express";
import { Role } from "@epms/shared";
import { reportController } from "../controllers/report.controller";
import { authenticate } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/rbac.middleware";

export const reportRouter = Router();

reportRouter.use(authenticate, requireRole(Role.SUPER_ADMIN));

reportRouter.get("/:type/pdf", reportController.pdf);
reportRouter.get("/:type/excel", reportController.excel);
