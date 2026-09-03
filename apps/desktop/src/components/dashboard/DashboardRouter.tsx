import { Role } from "@epms/shared";
import { useAuthStore } from "../../store/auth.store";
import StudentDashboard from "../../pages/dashboards/StudentDashboard";
import EmployeeDashboard from "../../pages/dashboards/EmployeeDashboard";
import ValidatorDashboard from "../../pages/dashboards/ValidatorDashboard";
import AdminDashboard from "../../pages/dashboards/AdminDashboard";

export function DashboardRouter() {
  const role = useAuthStore((state) => state.user?.role);
  if (role === Role.STUDENT) return <StudentDashboard />;
  if (role === Role.VALIDATOR) return <ValidatorDashboard />;
  if (role === Role.SUPER_ADMIN) return <AdminDashboard />;
  return <EmployeeDashboard />;
}
