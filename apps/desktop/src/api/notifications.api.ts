import { NotificationDTO } from "@epms/shared";
import { apiClient } from "./client";

export interface NotificationsResponse {
  items: NotificationDTO[];
  unreadCount: number;
}

export const notificationsApi = {
  list: (limit = 20) =>
    apiClient.get<NotificationsResponse>("/notifications", { params: { limit } }).then((r) => r.data),

  markAsRead: (id: string) => apiClient.patch(`/notifications/${id}/read`),

  markAllAsRead: () => apiClient.patch("/notifications/read-all"),
};
