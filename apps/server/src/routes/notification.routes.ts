import { Router } from "express";
import { notificationController } from "../controllers/notification.controller";
import { authenticate } from "../middleware/auth.middleware";

export const notificationRouter = Router();

notificationRouter.use(authenticate);

notificationRouter.get("/", notificationController.list);
notificationRouter.patch("/read-all", notificationController.markAllAsRead);
notificationRouter.patch("/:id/read", notificationController.markAsRead);
