import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { NotificationFilters, notificationsApi } from "../api/notifications.api";
import { useAuthStore } from "../store/auth.store";

export function useNotifications(limit = 20, page = 1, filters: NotificationFilters = {}) {
  const userId = useAuthStore((state) => state.user?._id);

  return useQuery({
    queryKey: ["notifications", userId, limit, page, filters],
    queryFn: () => notificationsApi.list(limit, page, filters),
    enabled: Boolean(userId),
    refetchOnMount: "always",
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });
}
