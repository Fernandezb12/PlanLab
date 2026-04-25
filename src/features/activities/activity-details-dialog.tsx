"use client";

import { CalendarDays, ClipboardList, FileText, Layers3 } from "lucide-react";

import { Modal } from "@/components/ui/modal";
import { getActivityStatusLabel } from "@/lib/validations/activities";

type ActivityDetailsDialogProps = {
  isOpen: boolean;
  activity: {
    title: string;
    activity_date: string | null;
    status: string;
    notes: string | null;
    lesson_plans: { title: string } | { title: string }[] | null;
    groups: { name: string; level: string | null } | { name: string; level: string | null }[] | null;
    created_at: string;
  } | null;
  onClose: () => void;
};

export const ActivityDetailsDialog = ({ isOpen, activity, onClose }: ActivityDetailsDialogProps) => {
  const relatedPlan = activity ? (Array.isArray(activity.lesson_plans) ? activity.lesson_plans[0] : activity.lesson_plans) : null;
  const relatedGroup = activity ? (Array.isArray(activity.groups) ? activity.groups[0] : activity.groups) : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={activity?.title ?? "Detalle de la actividad"}
      description="Consulta los datos básicos de la actividad sin salir del módulo."
      contentClassName="max-w-3xl p-0"
      bodyClassName="min-h-0 flex flex-1 flex-col overflow-hidden p-0"
    >
      {activity ? (
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-10 pt-5 scroll-smooth [scrollbar-color:rgba(148,163,184,0.42)_transparent] [scrollbar-width:thin] sm:px-6 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300/70 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700/70">
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
                  <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                    <ClipboardList className="h-4 w-4" />
                    Plan asociado
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">{relatedPlan?.title ?? "Sin plan asociado"}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
                  <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                    <Layers3 className="h-4 w-4" />
                    Grupo
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">{relatedGroup?.name ?? "Sin grupo"}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{relatedGroup?.level ?? "Sin nivel"}</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
                  <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                    <CalendarDays className="h-4 w-4" />
                    Fecha
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">
                    {activity.activity_date ? new Date(activity.activity_date).toLocaleDateString("es-CO") : "Sin fecha"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{new Date(activity.created_at).toLocaleDateString("es-CO")}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Estado</p>
                  <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">{getActivityStatusLabel(activity.status)}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
                <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                  <FileText className="h-4 w-4" />
                  Notas
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-200">{activity.notes ?? "Sin notas registradas"}</p>
              </div>
            </div>
          </div>

          <div className="shrink-0 border-t border-slate-200 bg-white px-4 py-4 sm:px-6 dark:border-white/10 dark:bg-slate-950">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  );
};
