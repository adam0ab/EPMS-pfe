import { Schema, model, Types } from "mongoose";
import { NotificationType } from "@epms/shared";

export interface NotificationDocument {
  _id: Types.ObjectId;
  recipient: Types.ObjectId;
  type: NotificationType;
  message: string;
  procedure?: Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<NotificationDocument>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: Object.values(NotificationType), required: true },
    message: { type: String, required: true },
    procedure: { type: Schema.Types.ObjectId, ref: "Procedure" },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1 });

export const NotificationModel = model<NotificationDocument>("Notification", notificationSchema);
