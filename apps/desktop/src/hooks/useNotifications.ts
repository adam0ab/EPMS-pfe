import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "../api/notifications.api";

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationsApi.list(20),
    refetchInterval: 30_000,
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
