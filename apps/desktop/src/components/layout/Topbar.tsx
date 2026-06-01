import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { SearchBar } from "../ui/SearchBar";
import { useThemeStore } from "../../store/theme.store";
import { useAuthStore } from "../../store/auth.store";
import { LogoutIcon, MoonIcon, SunIcon } from "./icons";
import { NotificationBell } from "./NotificationBell";

export function Topbar() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemeStore();
  const { user, logout } = useAuthStore();
  const [search, setSearch] = useState("");

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && search.trim()) {
      navigate(`/procedures?search=${encodeURIComponent(search.trim())}`);
    }
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200/70 bg-surface-card px-6 dark:border-surface-dark-border dark:bg-surface-dark-card">
      <SearchBar
        placeholder="Search procedures, departments, categories…"
        className="w-full max-w-md"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={handleSearchKeyDown}
      />

      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
        </button>

        <NotificationBell />

        <div className="h-8 w-px bg-slate-200 dark:bg-surface-dark-border" />

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-secondary dark:text-white leading-tight">{user?.fullName}</p>
            <p className="text-xs capitalize text-slate-400 leading-tight">{user?.role.replace("_", " ")}</p>
          </div>
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
            aria-label="Logout"
          >
            <LogoutIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
