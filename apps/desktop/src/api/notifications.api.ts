import { NotificationDTO } from "@epms/shared";
import { apiClient } from "./client";

export interface NotificationsResponse {
  items: NotificationDTO[];
  unreadCount: number;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  summary: { total: number; unread: number; important: number; recent: number };
}

export interface NotificationFilters {
  status?: "all" | "unread" | "read";
  type?: string;
  date?: "all" | "today" | "week";
  search?: string;
  important?: boolean;
}

export const notificationsApi = {
  list: (limit = 20, page = 1, filters: NotificationFilters = {}) =>
    apiClient.get<NotificationsResponse>("/notifications", { params: { limit, page, ...filters } }).then((r) => r.data),

  markAsRead: (id: string) => apiClient.patch(`/notifications/${id}/read`),

  markAllAsRead: () => apiClient.patch("/notifications/read-all"),
};
