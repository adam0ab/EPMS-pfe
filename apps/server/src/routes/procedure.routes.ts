import { Router } from "express";
import { Role } from "@epms/shared";
import { procedureController } from "../controllers/procedure.controller";
import { authenticate } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/rbac.middleware";

export const procedureRouter = Router();

procedureRouter.use(authenticate);

procedureRouter.get("/", procedureController.list);
procedureRouter.get("/:id", procedureController.getById);
procedureRouter.get("/:id/recommendations", procedureController.recommendations);
procedureRouter.post("/", requireRole(Role.SUPER_ADMIN), procedureController.create);
procedureRouter.patch("/:id", requireRole(Role.SUPER_ADMIN), procedureController.update);
procedureRouter.post("/:id/publish", requireRole(Role.SUPER_ADMIN), procedureController.publish);
procedureRouter.post("/:id/archive", requireRole(Role.SUPER_ADMIN), procedureController.archive);
procedureRouter.delete("/:id", requireRole(Role.SUPER_ADMIN), procedureController.remove);
