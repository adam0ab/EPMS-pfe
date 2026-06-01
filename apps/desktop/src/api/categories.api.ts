import { CategoryDTO } from "@epms/shared";
import { apiClient } from "./client";

export const categoriesApi = {
  list: () => apiClient.get<CategoryDTO[]>("/categories").then((r) => r.data),

  create: (data: { name: string; group: string }) =>
    apiClient.post<CategoryDTO>("/categories", data).then((r) => r.data),

  update: (id: string, data: { name?: string; group?: string }) =>
    apiClient.patch<CategoryDTO>(`/categories/${id}`, data).then((r) => r.data),

  remove: (id: string) => apiClient.delete(`/categories/${id}`),
};
