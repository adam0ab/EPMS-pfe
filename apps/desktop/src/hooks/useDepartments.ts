import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { departmentsApi } from "../api/departments.api";

export function useDepartments() {
  return useQuery({ queryKey: ["departments"], queryFn: departmentsApi.list });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: departmentsApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["departments"] }),
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; description?: string } }) =>
      departmentsApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["departments"] }),
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: departmentsApi.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["departments"] }),
  });
}
