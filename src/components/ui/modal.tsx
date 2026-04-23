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
  bodyClassName?: string;
  headerClassName?: string;
  closeOnOverlayClick?: boolean;
};

export const Modal = ({
  isOpen,
  title,
  description,
  children,
  onClose,
  contentClassName,
  bodyClassName,
  headerClassName,
  closeOnOverlayClick = true
}: ModalProps) => {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

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
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center bg-slate-950/46 px-3 py-4 backdrop-blur-[3px] sm:px-4 sm:py-5 md:items-center md:px-6 md:py-8 dark:bg-slate-950/74 dark:backdrop-blur-sm"
      onClick={() => {
        if (closeOnOverlayClick) {
          onClose();
        }
      }}
    >
      <div
        className={cn(
          "flex max-h-[calc(100vh-2rem)] min-h-0 w-full max-w-2xl flex-col overflow-hidden rounded-[24px] border border-slate-200/95 bg-white shadow-[0_36px_90px_-38px_rgba(15,23,42,0.42)] sm:max-h-[calc(100vh-2.5rem)] sm:rounded-[30px] dark:border-white/10 dark:bg-slate-950/95 dark:shadow-[0_40px_90px_-40px_rgba(0,0,0,0.8)]",
          contentClassName
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className={cn(
            "flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-4 py-4 sm:px-6 sm:py-5 dark:border-white/10 dark:bg-slate-950/95",
            headerClassName
          )}
        >
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl dark:text-white">{title}</h2>
            {description ? <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 bg-white p-2 text-slate-600 transition hover:bg-slate-100 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:bg-white/10"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className={cn("min-h-0 bg-slate-50/55 px-4 py-4 sm:px-6 sm:py-5 dark:bg-transparent", bodyClassName)}>{children}</div>
      </div>
    </div>
  );
};
