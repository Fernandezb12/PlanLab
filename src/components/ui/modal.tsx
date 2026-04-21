"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { cn } from "@/lib/utils/cn";

type ModalProps = {
  isOpen: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
  contentClassName?: string;
};

export const Modal = ({ isOpen, title, description, children, onClose, contentClassName }: ModalProps) => {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    // Yo permito cerrar con Escape para mantener el flujo ágil.
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/70 px-4 py-8 backdrop-blur-sm" onClick={onClose}>
      <div
        className={cn("w-full max-w-2xl rounded-[28px] border border-white/10 bg-slate-950/95 p-6 shadow-2xl shadow-black/40", contentClassName)}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">{title}</h2>
            {description ? <p className="mt-1 text-sm text-slate-400">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 p-2 text-slate-300 transition hover:bg-white/10"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
};
