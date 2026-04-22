import { cn } from "@/lib/utils/cn";
import type { HTMLAttributes } from "react";

export const Card = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "rounded-[24px] border border-slate-200/90 bg-white p-5 shadow-[0_16px_34px_-28px_rgba(15,23,42,0.32)] dark:border-slate-800 dark:bg-slate-900",
      className
    )}
    {...props}
  />
);
