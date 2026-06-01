import { Router } from "express";
import { Role } from "@epms/shared";
import { departmentController } from "../controllers/department.controller";
import { authenticate } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/rbac.middleware";

export const departmentRouter = Router();

departmentRouter.use(authenticate);

departmentRouter.get("/", departmentController.list);
departmentRouter.post("/", requireRole(Role.SUPER_ADMIN), departmentController.create);
departmentRouter.patch("/:id", requireRole(Role.SUPER_ADMIN), departmentController.update);
departmentRouter.delete("/:id", requireRole(Role.SUPER_ADMIN), departmentController.remove);
