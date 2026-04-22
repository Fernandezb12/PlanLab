import { cn } from "@/lib/utils/cn";

type SkeletonProps = {
  className?: string;
};

export const Skeleton = ({ className }: SkeletonProps) => <div className={cn("animate-pulse rounded-xl bg-white/10", className)} />;
