import { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

const baseInputClasses =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-secondary " +
  "placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 " +
  "dark:border-surface-dark-border dark:bg-surface-dark dark:text-slate-100";

export function FieldWrapper({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">{label}</span>
      {children}
    </label>
  );
}

export function TextInput({ label, ...props }: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <FieldWrapper label={label}>
      <input className={baseInputClasses} {...props} />
    </FieldWrapper>
  );
}

export function TextArea({ label, ...props }: { label: string } & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <FieldWrapper label={label}>
      <textarea className={baseInputClasses + " min-h-[90px]"} {...props} />
    </FieldWrapper>
  );
}

export function Select({
  label,
  children,
  ...props
}: { label: string; children: ReactNode } & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <FieldWrapper label={label}>
      <select className={baseInputClasses} {...props}>
        {children}
      </select>
    </FieldWrapper>
  );
}
