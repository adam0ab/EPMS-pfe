import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Role } from "@epms/shared";

export interface AuthUser {
  _id: string;
  fullName: string;
  email: string;
  role: Role;
  department?: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  setSession: (token: string, user: AuthUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setSession: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
    }),
    { name: "epms-auth" }
  )
);
