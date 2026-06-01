import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { notificationService } from "../services/notification.service";

export const notificationController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const limit = Number(req.query.limit ?? 20);
    const [items, unreadCount] = await Promise.all([
      notificationService.listForUser(req.user!.sub, limit),
      notificationService.unreadCount(req.user!.sub),
    ]);
    res.json({ items, unreadCount });
  }),

  markAsRead: asyncHandler(async (req: Request, res: Response) => {
    const notification = await notificationService.markAsRead(req.params.id, req.user!.sub);
    res.json(notification);
  }),

  markAllAsRead: asyncHandler(async (req: Request, res: Response) => {
    await notificationService.markAllAsRead(req.user!.sub);
    res.status(204).send();
  }),
};
