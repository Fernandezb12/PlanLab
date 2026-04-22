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
  warning: "border-amber-400/40 bg-amber-500/12 text-amber-50",
  success: "border-emerald-400/40 bg-emerald-500/12 text-emerald-50"
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
      <div className={cn("pointer-events-auto flex max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-md", toneClasses[tone])}>
        <Icon className="mt-0.5 h-4 w-4 shrink-0" />
        <p className="text-sm leading-6">{message}</p>
        <button type="button" onClick={onClose} className="rounded-lg p-1 text-current/80 transition hover:bg-white/10" aria-label="Cerrar notificación">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
