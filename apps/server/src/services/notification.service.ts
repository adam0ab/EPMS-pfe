import { NotificationType } from "@epms/shared";
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

  listForUser(userId: string, limit?: number) {
    return notificationRepository.findForUser(userId, limit);
  },

  unreadCount(userId: string) {
    return notificationRepository.count({ recipient: userId, isRead: false } as never);
  },

  markAsRead(id: string, userId: string) {
    return notificationRepository.markAsRead(id, userId);
  },

  markAllAsRead(userId: string) {
    return notificationRepository.markAllAsRead(userId);
  },
};
