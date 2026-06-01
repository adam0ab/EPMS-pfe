import { create } from "zustand";

type Theme = "light" | "dark";

const STORAGE_KEY = "epms-theme";

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  applyToDocument: () => void;
}

function getInitialTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: getInitialTheme(),

  applyToDocument: () => {
    document.documentElement.classList.toggle("dark", get().theme === "dark");
  },

  setTheme: (theme) => {
    localStorage.setItem(STORAGE_KEY, theme);
    set({ theme });
    get().applyToDocument();
  },

  toggleTheme: () => {
    const next = get().theme === "dark" ? "light" : "dark";
    get().setTheme(next);
  },
}));
