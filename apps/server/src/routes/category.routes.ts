import { Router } from "express";
import { Role } from "@epms/shared";
import { categoryController } from "../controllers/category.controller";
import { authenticate } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/rbac.middleware";

export const categoryRouter = Router();

categoryRouter.use(authenticate);

categoryRouter.get("/", categoryController.list);
categoryRouter.post("/", requireRole(Role.SUPER_ADMIN), categoryController.create);
categoryRouter.patch("/:id", requireRole(Role.SUPER_ADMIN), categoryController.update);
categoryRouter.delete("/:id", requireRole(Role.SUPER_ADMIN), categoryController.remove);
