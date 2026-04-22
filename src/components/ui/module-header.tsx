import type { ReactNode } from "react";

type ModuleHeaderProps = {
  title: string;
  subtitle: string;
  actions?: ReactNode;
};

export const ModuleHeader = ({ title, subtitle, actions }: ModuleHeaderProps) => (
  <div className="flex flex-wrap items-start justify-between gap-4">
    <div className="space-y-1.5">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">{title}</h1>
      <p className="max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">{subtitle}</p>
    </div>
    {actions ? <div className="flex flex-wrap items-center gap-2.5">{actions}</div> : null}
  </div>
);
