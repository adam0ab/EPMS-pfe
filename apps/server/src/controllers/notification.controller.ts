import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { notificationService } from "../services/notification.service";

export const notificationController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const limit = Math.min(Math.max(Number(req.query.limit ?? 20), 1), 100);
    const page = Math.max(Number(req.query.page ?? 1), 1);
    const filters = { status: typeof req.query.status === "string" ? req.query.status : undefined, type: typeof req.query.type === "string" ? req.query.type : undefined, date: typeof req.query.date === "string" ? req.query.date : undefined, search: typeof req.query.search === "string" ? req.query.search : undefined, important: req.query.important === "true" };
    const [items, summary, total] = await Promise.all([
      notificationService.listForUser(req.user!.sub, limit, (page - 1) * limit, filters),
      notificationService.summaryForUser(req.user!.sub),
      notificationService.countForUserWithFilters(req.user!.sub, filters),
    ]);
    res.json({ items, unreadCount: summary.unread, total, summary, page, pageSize: limit, totalPages: Math.max(1, Math.ceil(total / limit)) });
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
