import { FilterQuery } from "mongoose";
import { NotificationDocument, NotificationModel } from "../models/Notification.model";
import { BaseRepository } from "./base.repository";

export class NotificationRepository extends BaseRepository<NotificationDocument> {
  constructor() {
    super(NotificationModel);
  }

  findForUser(filter: FilterQuery<NotificationDocument>, limit = 20, skip = 0) {
    return this.model.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);
  }

  markAsRead(id: string, userId: string) {
    return this.model.findOneAndUpdate({ _id: id, recipient: userId }, { isRead: true }, { new: true });
  }

  markAllAsRead(userId: string) {
    return this.model.updateMany({ recipient: userId, isRead: false }, { isRead: true });
  }

  insertForRecipients(recipientIds: string[], data: { type: NotificationDocument["type"]; message: string; procedure: string }) {
    return this.model.insertMany(
      recipientIds.map((recipient) => ({ recipient, ...data }))
    );
  }
}

export const notificationRepository = new NotificationRepository();
