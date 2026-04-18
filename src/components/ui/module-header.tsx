import type { ReactNode } from "react";

type ModuleHeaderProps = {
  title: string;
  subtitle: string;
  actions?: ReactNode;
};

export const ModuleHeader = ({ title, subtitle, actions }: ModuleHeaderProps) => (
  <div className="flex flex-wrap items-start justify-between gap-3">
    <div className="space-y-1">
      <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
    </div>
    {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
  </div>
);
