import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Role } from "@epms/shared";
import { studentCalendarApi } from "../api/studentCalendar.api";
import { useAuthStore } from "../store/auth.store";

export function useStudentCalendar() {
  const role = useAuthStore((state) => state.user?.role);
  return useQuery({ queryKey: ["student-calendar"], queryFn: studentCalendarApi.list, enabled: role === Role.STUDENT });
}

export function useAddToStudentCalendar() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: studentCalendarApi.add, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["student-calendar"] }) });
}

export function useRemoveFromStudentCalendar() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: studentCalendarApi.remove, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["student-calendar"] }) });
}
