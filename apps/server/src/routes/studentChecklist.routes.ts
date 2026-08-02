import { Router } from "express";
import { Role } from "@epms/shared";
import { authenticate } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/rbac.middleware";
import { studentChecklistController } from "../controllers/studentChecklist.controller";

export const studentChecklistRouter = Router();
studentChecklistRouter.use(authenticate, requireRole(Role.STUDENT));
studentChecklistRouter.get("/", studentChecklistController.list);
studentChecklistRouter.get("/attention", studentChecklistController.attention);
studentChecklistRouter.post("/:procedureId", studentChecklistController.add);
studentChecklistRouter.patch("/:procedureId/steps/:stepOrder", studentChecklistController.setStepCompletion);
