import { Router } from "express";
import { Role } from "@epms/shared";
import { authenticate } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/rbac.middleware";
import { studentCalendarController } from "../controllers/studentCalendar.controller";

export const studentCalendarRouter = Router();
studentCalendarRouter.use(authenticate, requireRole(Role.STUDENT));
studentCalendarRouter.get("/", studentCalendarController.list);
studentCalendarRouter.post("/:procedureId", studentCalendarController.add);
studentCalendarRouter.delete("/:procedureId", studentCalendarController.remove);
