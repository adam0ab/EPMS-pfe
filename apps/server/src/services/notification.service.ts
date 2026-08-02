import { NotificationType, Role } from "@epms/shared";
import { FilterQuery } from "mongoose";
import { NotificationDocument } from "../models/Notification.model";
import { ProcedureModel } from "../models/Procedure.model";
import { notificationRepository } from "../repositories/notification.repository";
import { userRepository } from "../repositories/user.repository";

export const notificationService = {
  async notifyAll(type: NotificationType, message: string, procedureId: string, excludeUserId?: string) {
    const users = await userRepository.find({ isActive: true });
    const recipientIds = users
      .map((u) => u._id.toString())
      .filter((id) => id !== excludeUserId);

    if (recipientIds.length === 0) return;

    await notificationRepository.insertForRecipients(recipientIds, {
      type,
      message,
      procedure: procedureId,
    } as never);
  },

  async notifyUser(recipientId: string, type: NotificationType, message: string, procedureId: string) {
    await notificationRepository.create({
      recipient: recipientId,
      type,
      message,
      procedure: procedureId,
    } as never);
  },

  async notifyRole(role: Role, type: NotificationType, message: string, procedureId: string, excludeUserId?: string) {
    const users = await userRepository.find({ role, isActive: true } as never);
    const recipientIds = users.map((user) => user._id.toString()).filter((id) => id !== excludeUserId);
    if (recipientIds.length === 0) return;
    await notificationRepository.insertForRecipients(recipientIds, { type, message, procedure: procedureId } as never);
  },

  async listForUser(userId: string, limit?: number, skip?: number, options?: { status?: string; type?: string; date?: string; search?: string; important?: boolean }) {
    const filter: FilterQuery<NotificationDocument> = { recipient: userId };
    if (options?.status === "unread") filter.isRead = false;
    if (options?.status === "read") filter.isRead = true;
    if (options?.type && Object.values(NotificationType).includes(options.type as NotificationType)) filter.type = options.type as NotificationType;
    if (options?.important) filter.type = { $in: [NotificationType.PROCEDURE_SUBMITTED_FOR_REVIEW, NotificationType.PROCEDURE_REJECTED] };

    if (options?.date === "today" || options?.date === "week") {
      const start = new Date();
      if (options.date === "today") start.setHours(0, 0, 0, 0);
      else start.setDate(start.getDate() - 7);
      filter.createdAt = { $gte: start };
    }

    const search = options?.search?.trim();
    if (search) {
      const expression = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      const procedures = await ProcedureModel.find({ title: expression }).select("_id").lean();
      filter.$or = [{ message: expression }, { procedure: { $in: procedures.map((procedure) => procedure._id) } }];
    }
    return notificationRepository.findForUser(filter, limit, skip);
  },

  async countForUserWithFilters(userId: string, options?: { status?: string; type?: string; date?: string; search?: string; important?: boolean }) {
    const filter: FilterQuery<NotificationDocument> = { recipient: userId };
    if (options?.status === "unread") filter.isRead = false;
    if (options?.status === "read") filter.isRead = true;
    if (options?.type && Object.values(NotificationType).includes(options.type as NotificationType)) filter.type = options.type as NotificationType;
    if (options?.important) filter.type = { $in: [NotificationType.PROCEDURE_SUBMITTED_FOR_REVIEW, NotificationType.PROCEDURE_REJECTED] };
    if (options?.date === "today" || options?.date === "week") {
      const start = new Date();
      if (options.date === "today") start.setHours(0, 0, 0, 0); else start.setDate(start.getDate() - 7);
      filter.createdAt = { $gte: start };
    }
    const search = options?.search?.trim();
    if (search) {
      const expression = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      const procedures = await ProcedureModel.find({ title: expression }).select("_id").lean();
      filter.$or = [{ message: expression }, { procedure: { $in: procedures.map((procedure) => procedure._id) } }];
    }
    return notificationRepository.count(filter);
  },

  async summaryForUser(userId: string) {
    const recentSince = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const importantTypes = [NotificationType.PROCEDURE_SUBMITTED_FOR_REVIEW, NotificationType.PROCEDURE_REJECTED];
    const [total, unread, important, recent] = await Promise.all([
      notificationRepository.count({ recipient: userId } as never),
      notificationRepository.count({ recipient: userId, isRead: false } as never),
      notificationRepository.count({ recipient: userId, type: { $in: importantTypes } } as never),
      notificationRepository.count({ recipient: userId, createdAt: { $gte: recentSince } } as never),
    ]);
    return { total, unread, important, recent };
  },

  countForUser(userId: string) {
    return notificationRepository.count({ recipient: userId } as never);
  },

  unreadCount(userId: string) {
    return notificationRepository.count({ recipient: userId, isRead: false } as never);
  },

  async hasProcedureAccess(userId: string, procedureId: string) {
    return Boolean(await notificationRepository.findOne({ recipient: userId, procedure: procedureId } as never));
  },

  markAsRead(id: string, userId: string) {
    return notificationRepository.markAsRead(id, userId);
  },

  markAllAsRead(userId: string) {
    return notificationRepository.markAllAsRead(userId);
  },
};
