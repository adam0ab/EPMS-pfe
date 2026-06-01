import { Navigate, Outlet } from "react-router-dom";
import { Role } from "@epms/shared";
import { useAuthStore } from "../store/auth.store";

export function ProtectedRoute() {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export function RequireRole({ roles }: { roles: Role[] }) {
  const user = useAuthStore((s) => s.user);
  if (!user || !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
