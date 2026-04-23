import type { ReactNode } from "react";

type ModuleHeaderProps = {
  title: string;
  subtitle: string;
  actions?: ReactNode;
};

export const ModuleHeader = ({ title, subtitle, actions }: ModuleHeaderProps) => (
  <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
    <div className="space-y-1.5">
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-3xl">{title}</h1>
      <p className="max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">{subtitle}</p>
    </div>
    {actions ? <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">{actions}</div> : null}
  </div>
);
