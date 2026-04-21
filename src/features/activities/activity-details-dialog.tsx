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
      contentClassName="max-w-3xl"
    >
      {activity ? (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                <ClipboardList className="h-4 w-4" />
                Plan asociado
              </p>
              <p className="mt-2 text-sm font-semibold text-white">{relatedPlan?.title ?? "Sin plan asociado"}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                <Layers3 className="h-4 w-4" />
                Grupo
              </p>
              <p className="mt-2 text-sm font-semibold text-white">{relatedGroup?.name ?? "Sin grupo"}</p>
              <p className="mt-1 text-sm text-slate-400">{relatedGroup?.level ?? "Sin nivel"}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                <CalendarDays className="h-4 w-4" />
                Fecha
              </p>
              <p className="mt-2 text-sm font-semibold text-white">
                {activity.activity_date ? new Date(activity.activity_date).toLocaleDateString("es-CO") : "Sin fecha"}
              </p>
              <p className="mt-1 text-sm text-slate-400">{new Date(activity.created_at).toLocaleDateString("es-CO")}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Estado</p>
              <p className="mt-2 text-sm font-semibold text-white">{getActivityStatusLabel(activity.status)}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-slate-500">
              <FileText className="h-4 w-4" />
              Notas
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-200">{activity.notes ?? "Sin notas registradas"}</p>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/10"
            >
              Cerrar
            </button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
};
