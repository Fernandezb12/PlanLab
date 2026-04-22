import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  action?: ReactNode;
};

export const EmptyState = ({ icon: Icon, title, description, actionLabel, action }: EmptyStateProps) => (
  <div className="rounded-[28px] border border-dashed border-slate-300 bg-white/90 px-7 py-9 text-center shadow-[0_18px_38px_-34px_rgba(15,23,42,0.4)] dark:border-white/15 dark:bg-white/[0.03]">
    <div className="mx-auto grid h-11 w-11 place-items-center rounded-2xl bg-slate-100 dark:bg-white/10">
      <Icon className="h-5 w-5 text-slate-700 dark:text-slate-300" />
    </div>
    <h3 className="mt-3 text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">{title}</h3>
    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-400">{description}</p>
    {actionLabel ? (
      <button type="button" className="mt-4 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 transition hover:bg-slate-100 dark:border-white/15 dark:bg-white/[0.05] dark:text-slate-200 dark:hover:bg-white/10">
        {actionLabel}
      </button>
    ) : null}
    {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
  </div>
);
