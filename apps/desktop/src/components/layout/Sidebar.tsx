import { NavLink } from "react-router-dom";
import clsx from "clsx";
import { Role } from "@epms/shared";
import { useAuthStore } from "../../store/auth.store";
import { useNotifications } from "../../hooks/useNotifications";
import { BellIcon, CategoryIcon, DashboardIcon, DepartmentIcon, ProcedureIcon, ReportIcon, UsersIcon } from "./icons";
const AssistantIcon = ProcedureIcon;

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: DashboardIcon, roles: [Role.SUPER_ADMIN, Role.EMPLOYEE, Role.STUDENT, Role.VALIDATOR] },
  { to: "/notifications", label: "Notifications", icon: BellIcon, roles: [Role.SUPER_ADMIN, Role.EMPLOYEE, Role.STUDENT, Role.VALIDATOR] },
  { to: "/calendar", label: "Calendar", icon: DashboardIcon, roles: [Role.SUPER_ADMIN, Role.EMPLOYEE, Role.STUDENT, Role.VALIDATOR] },
  { to: "/procedures", label: "Procedures", icon: ProcedureIcon, roles: [Role.SUPER_ADMIN, Role.EMPLOYEE, Role.STUDENT, Role.VALIDATOR] },
  { to: "/my-checklist", label: "My Checklist", icon: ProcedureIcon, roles: [Role.STUDENT] },
  { to: "/recommendations", label: "Recommandations", icon: ProcedureIcon, roles: [Role.EMPLOYEE, Role.STUDENT] },
  { to: "/procedures/assistant", label: "Assistant IA", icon: AssistantIcon, roles: [Role.EMPLOYEE, Role.STUDENT] },
  { to: "/departments", label: "Departments", icon: DepartmentIcon, roles: [Role.SUPER_ADMIN] },
  { to: "/feedback-quality", label: "Feedback & Quality", icon: ReportIcon, roles: [Role.SUPER_ADMIN] },
  { to: "/categories", label: "Categories", icon: CategoryIcon, roles: [Role.SUPER_ADMIN] },
  { to: "/users", label: "Users", icon: UsersIcon, roles: [Role.SUPER_ADMIN] },
  { to: "/reports", label: "Reports", icon: ReportIcon, roles: [Role.SUPER_ADMIN] },
];

const studentNavItems = [
  { to: "/dashboard", label: "Dashboard", icon: DashboardIcon },
  { to: "/procedures", label: "Procedures", icon: ProcedureIcon },
  { to: "/my-checklist", label: "My Checklist", icon: ProcedureIcon },
  { to: "/dashboard#needs-attention", label: "Needs Your Attention", icon: BellIcon },
  { to: "/calendar", label: "Calendar", icon: DashboardIcon },
  { to: "/recommendations", label: "Recommendations", icon: ProcedureIcon },
  { to: "/procedures/assistant", label: "AI Assistant", icon: AssistantIcon },
  { to: "/notifications", label: "Notifications", icon: BellIcon },
];

export function Sidebar() {
  const role = useAuthStore((s) => s.user?.role);
  const { data } = useNotifications(1);
  const unreadCount = data?.unreadCount ?? 0;
  const items = role === Role.STUDENT ? studentNavItems : navItems.filter((item) => !role || item.roles.includes(role));

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
        {items
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
              <span>{item.label}</span>
              {item.to === "/notifications" && unreadCount > 0 && <span className="ml-auto rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-semibold text-white">{unreadCount > 99 ? "99+" : unreadCount}</span>}
            </NavLink>
          ))}
      </nav>

      <div className="border-t border-white/10 px-6 py-4 text-xs text-slate-400">
        EPMS v1.0 &middot; ESPRIT
      </div>
    </aside>
  );
}
