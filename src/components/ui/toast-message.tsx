"use client";

import { AlertTriangle, CheckCircle2, X } from "lucide-react";
import { useEffect } from "react";

import { cn } from "@/lib/utils/cn";

type ToastMessageProps = {
  message: string | null;
  tone?: "warning" | "success";
  onClose: () => void;
};

const toneClasses: Record<NonNullable<ToastMessageProps["tone"]>, string> = {
  warning:
    "border-amber-300 bg-amber-50/98 text-amber-950 shadow-[0_22px_48px_-28px_rgba(180,83,9,0.35)] dark:border-amber-500/35 dark:bg-amber-500/12 dark:text-amber-50 dark:shadow-[0_22px_48px_-28px_rgba(0,0,0,0.65)]",
  success:
    "border-emerald-300 bg-emerald-50/98 text-emerald-950 shadow-[0_22px_48px_-28px_rgba(5,150,105,0.32)] dark:border-emerald-500/35 dark:bg-emerald-500/12 dark:text-emerald-50 dark:shadow-[0_22px_48px_-28px_rgba(0,0,0,0.65)]"
};

export const ToastMessage = ({ message, tone = "warning", onClose }: ToastMessageProps) => {
  useEffect(() => {
    if (!message) {
      return;
    }

    const timeout = window.setTimeout(() => onClose(), 4200);
    return () => window.clearTimeout(timeout);
  }, [message, onClose]);

  if (!message) {
    return null;
  }

  const Icon = tone === "success" ? CheckCircle2 : AlertTriangle;

  return (
    <div className="pointer-events-none fixed right-5 top-5 z-[120]">
      <div className={cn("pointer-events-auto flex max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 backdrop-blur-md", toneClasses[tone])}>
        <Icon className="mt-0.5 h-4 w-4 shrink-0" />
        <p className="text-sm font-medium leading-6">{message}</p>
        <button type="button" onClick={onClose} className="rounded-lg p-1 text-current/80 transition hover:bg-black/5 dark:hover:bg-white/10" aria-label="Cerrar notificación">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
