import type { LucideIcon } from "lucide-react";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
};

export const EmptyState = ({ icon: Icon, title, description, actionLabel }: EmptyStateProps) => (
  <div className="rounded-2xl border border-dashed border-slate-300/80 bg-white/70 px-6 py-8 text-center dark:border-white/15 dark:bg-white/[0.03]">
    <div className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-slate-900/5 dark:bg-white/10">
      <Icon className="h-5 w-5 text-slate-600 dark:text-slate-300" />
    </div>
    <h3 className="mt-3 text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">{title}</h3>
    <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">{description}</p>
    {actionLabel ? (
      <button className="mt-4 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-white/15 dark:text-slate-200 dark:hover:bg-white/10">
        {actionLabel}
      </button>
    ) : null}
  </div>
);
