import { Router } from "express";
import { Role } from "@epms/shared";
import { reportController } from "../controllers/report.controller";
import { authenticate } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/rbac.middleware";

export const reportRouter = Router();

reportRouter.use(authenticate, requireRole(Role.SUPER_ADMIN));

reportRouter.get("/generate", reportController.generate);
reportRouter.get("/pdf", reportController.pdf);
reportRouter.get("/excel", reportController.excel);
