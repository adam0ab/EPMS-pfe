/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#E30613",
          50: "#FDE8EA",
          100: "#FBD1D6",
          600: "#C2050F",
          700: "#9A040C",
        },
        secondary: "#1E293B",
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",
        surface: {
          DEFAULT: "#F8FAFC",
          card: "#FFFFFF",
          dark: "#0F172A",
          "dark-card": "#1E293B",
          "dark-border": "#334155",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.08)",
      },
    },
  },
  plugins: [],
};
