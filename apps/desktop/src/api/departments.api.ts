import { DepartmentDTO } from "@epms/shared";
import { apiClient } from "./client";

export const departmentsApi = {
  list: () => apiClient.get<DepartmentDTO[]>("/departments").then((r) => r.data),

  create: (data: { name: string; description?: string }) =>
    apiClient.post<DepartmentDTO>("/departments", data).then((r) => r.data),

  update: (id: string, data: { name?: string; description?: string }) =>
    apiClient.patch<DepartmentDTO>(`/departments/${id}`, data).then((r) => r.data),

  remove: (id: string) => apiClient.delete(`/departments/${id}`),
};
