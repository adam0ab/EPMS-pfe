import { forwardRef, InputHTMLAttributes } from "react";
import clsx from "clsx";

export const SearchBar = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function SearchBar({
  className,
  ...props
}, ref) {
  return (
    <div className={clsx("relative", className)}>
      <svg
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
        />
      </svg>
      <input
        ref={ref}
        type="text"
        className={clsx(
          "w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-secondary",
          "placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
          "dark:border-surface-dark-border dark:bg-surface-dark-card dark:text-slate-100"
        )}
        {...props}
      />
    </div>
  );
});
