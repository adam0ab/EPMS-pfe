import { Router } from "express";
import { Role } from "@epms/shared";
import { authenticate } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/rbac.middleware";
import { procedureFeedbackController } from "../controllers/procedureFeedback.controller";
export const procedureFeedbackRouter = Router(); procedureFeedbackRouter.use(authenticate); procedureFeedbackRouter.get("/mine/:procedureId", requireRole(Role.STUDENT), procedureFeedbackController.mine); procedureFeedbackRouter.put("/mine/:procedureId", requireRole(Role.STUDENT), procedureFeedbackController.save); procedureFeedbackRouter.get("/admin", requireRole(Role.SUPER_ADMIN), procedureFeedbackController.list); procedureFeedbackRouter.get("/admin/summary", requireRole(Role.SUPER_ADMIN), procedureFeedbackController.summary); procedureFeedbackRouter.patch("/admin/:id/status", requireRole(Role.SUPER_ADMIN), procedureFeedbackController.status);
