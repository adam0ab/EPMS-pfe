import { Role, UserDTO } from "@epms/shared";
import { apiClient } from "./client";

export interface CreateUserPayload {
  fullName: string;
  email: string;
  password: string;
  role: Role;
  department?: string;
}

export const usersApi = {
  list: () => apiClient.get<UserDTO[]>("/users").then((r) => r.data),

  create: (data: CreateUserPayload) => apiClient.post<UserDTO>("/users", data).then((r) => r.data),

  update: (id: string, data: Partial<CreateUserPayload> & { isActive?: boolean }) =>
    apiClient.patch<UserDTO>(`/users/${id}`, data).then((r) => r.data),

  remove: (id: string) => apiClient.delete(`/users/${id}`),
};
