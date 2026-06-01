import { apiClient } from "./client";
import { AuthUser } from "../store/auth.store";

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<LoginResponse>("/auth/login", { email, password }).then((r) => r.data),

  me: () => apiClient.get<AuthUser>("/auth/me").then((r) => r.data),
};
