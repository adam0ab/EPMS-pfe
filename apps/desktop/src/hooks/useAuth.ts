import { useMutation } from "@tanstack/react-query";
import { authApi } from "../api/auth.api";
import { useAuthStore } from "../store/auth.store";

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: (data) => setSession(data.token, data.user),
  });
}

export function useCurrentUser() {
  return useAuthStore((s) => s.user);
}
