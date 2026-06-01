import { Router } from "express";
import { Role } from "@epms/shared";
import { userController } from "../controllers/user.controller";
import { authenticate } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/rbac.middleware";

export const userRouter = Router();

userRouter.use(authenticate, requireRole(Role.SUPER_ADMIN));

userRouter.get("/", userController.list);
userRouter.post("/", userController.create);
userRouter.patch("/:id", userController.update);
userRouter.delete("/:id", userController.remove);
