import { ReactNode } from "react";

export function Modal({
  open,
  onClose,
  title,
  children,
  widthClassName = "max-w-lg",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  widthClassName?: string;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className={`w-full ${widthClassName} max-h-[85vh] overflow-y-auto rounded-xl bg-surface-card p-6 shadow-xl dark:bg-surface-dark-card`}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-secondary dark:text-white">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-secondary dark:hover:bg-slate-700"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
