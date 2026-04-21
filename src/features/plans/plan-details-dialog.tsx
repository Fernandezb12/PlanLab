"use client";

import { Clock3, FileText, GraduationCap, Layers3 } from "lucide-react";

import { Modal } from "@/components/ui/modal";
import { getEvaluationTypeLabel, getPlanStatusLabel } from "@/lib/validations/plans";

type PlanDetailsDialogProps = {
  isOpen: boolean;
  plan: {
    title: string;
    subject: string;
    topic: string;
    duration_minutes: number;
    objective: string;
    resources: string | null;
    evaluation_type: string;
    status: string;
    groups: { name: string; level: string | null } | { name: string; level: string | null }[] | null;
    created_at: string;
  } | null;
  onClose: () => void;
};

export const PlanDetailsDialog = ({ isOpen, plan, onClose }: PlanDetailsDialogProps) => {
  const relatedGroup = plan ? (Array.isArray(plan.groups) ? plan.groups[0] : plan.groups) : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={plan?.title ?? "Detalle del plan"}
      description="Consulta la información guardada del plan sin salir del módulo."
      contentClassName="max-w-3xl"
    >
      {plan ? (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                <Layers3 className="h-4 w-4" />
                Grupo
              </p>
              <p className="mt-2 text-sm font-semibold text-white">{relatedGroup?.name ?? "Sin grupo"}</p>
              <p className="mt-1 text-sm text-slate-400">{relatedGroup?.level ?? "Sin nivel"}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                <Clock3 className="h-4 w-4" />
                Duración
              </p>
              <p className="mt-2 text-sm font-semibold text-white">{plan.duration_minutes} minutos</p>
              <p className="mt-1 text-sm text-slate-400">{new Date(plan.created_at).toLocaleDateString("es-CO")}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Área</p>
              <p className="mt-2 text-sm font-semibold text-white">{plan.subject}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Tema</p>
              <p className="mt-2 text-sm font-semibold text-white">{plan.topic}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-slate-500">
                <GraduationCap className="h-4 w-4" />
                Evaluación
              </p>
              <p className="mt-2 text-sm font-semibold text-white">{getEvaluationTypeLabel(plan.evaluation_type)}</p>
              <p className="mt-1 text-sm text-slate-400">Estado: {getPlanStatusLabel(plan.status)}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Objetivo</p>
            <p className="mt-2 text-sm leading-6 text-slate-200">{plan.objective}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-slate-500">
              <FileText className="h-4 w-4" />
              Recursos
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-200">{plan.resources ?? "Sin recursos definidos"}</p>
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
