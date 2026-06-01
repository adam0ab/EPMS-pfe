import { NavLink } from "react-router-dom";
import clsx from "clsx";
import { Role } from "@epms/shared";
import { useAuthStore } from "../../store/auth.store";
import { CategoryIcon, DashboardIcon, DepartmentIcon, ProcedureIcon, ReportIcon, UsersIcon } from "./icons";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: DashboardIcon, roles: [Role.SUPER_ADMIN, Role.EMPLOYEE] },
  { to: "/procedures", label: "Procedures", icon: ProcedureIcon, roles: [Role.SUPER_ADMIN, Role.EMPLOYEE] },
  { to: "/departments", label: "Departments", icon: DepartmentIcon, roles: [Role.SUPER_ADMIN] },
  { to: "/categories", label: "Categories", icon: CategoryIcon, roles: [Role.SUPER_ADMIN] },
  { to: "/users", label: "Users", icon: UsersIcon, roles: [Role.SUPER_ADMIN] },
  { to: "/reports", label: "Reports", icon: ReportIcon, roles: [Role.SUPER_ADMIN] },
];

export function Sidebar() {
  const role = useAuthStore((s) => s.user?.role);

  return (
    <aside className="flex h-full w-64 flex-col bg-secondary text-slate-200">
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-base font-bold text-white">
          E
        </div>
        <div>
          <p className="text-sm font-semibold text-white leading-tight">EPMS</p>
          <p className="text-xs text-slate-400 leading-tight">ESPRIT Procedures</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navItems
          .filter((item) => !role || item.roles.includes(role))
          .map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-white"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
      </nav>

      <div className="border-t border-white/10 px-6 py-4 text-xs text-slate-400">
        EPMS v1.0 &middot; ESPRIT
      </div>
    </aside>
  );
}
