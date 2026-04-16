import { cn } from "@/lib/utils/cn";

export const SectionTitle = ({
  badge,
  title,
  description,
  className
}: {
  badge: string;
  title: string;
  description: string;
  className?: string;
}) => (
  <div className={cn("mx-auto max-w-3xl text-center", className)}>
    <p className="inline-flex rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-700 dark:text-brand-300">
      {badge}
    </p>
    <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-white md:text-4xl">{title}</h2>
    <p className="mt-3 text-base text-slate-600 dark:text-slate-300">{description}</p>
  </div>
);
