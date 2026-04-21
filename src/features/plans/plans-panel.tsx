"use client";

import { Copy, Eye, Pencil, PlusCircle, Trash2 } from "lucide-react";
import { useMemo, useState, useTransition } from "react";

import { EmptyState } from "@/components/ui/empty-state";
import { Card } from "@/components/ui/card";
import { ModuleHeader } from "@/components/ui/module-header";
import { createPlanAction, deletePlanAction, duplicatePlanAction, type PlanActionResult, updatePlanAction } from "@/features/plans/actions";
import { PlanDetailsDialog } from "@/features/plans/plan-details-dialog";
import { PlanFormDialog } from "@/features/plans/plan-form-dialog";
import { getEvaluationTypeLabel, getPlanStatusLabel } from "@/lib/validations/plans";

type GroupOption = {
  id: string;
  name: string;
  level: string | null;
};

type PlanRecord = {
  id: string;
  group_id: string | null;
  title: string;
  subject: string;
  topic: string;
  duration_minutes: number;
  objective: string;
  resources: string | null;
  evaluation_type: string;
  status: string;
  created_at: string;
  groups: { name: string; level: string | null } | { name: string; level: string | null }[] | null;
};

type FeedbackState = {
  tone: "success" | "error";
  message: string;
} | null;

const statusStyles: Record<string, string> = {
  draft: "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  ready: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  archived: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
};

type PlansPanelProps = {
  groups: GroupOption[];
  plans: PlanRecord[];
};

export const PlansPanel = ({ groups, plans }: PlansPanelProps) => {
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [isDuplicating, startDuplicateTransition] = useTransition();
  const [formOpen, setFormOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanRecord | null>(null);

  const groupedOptions = useMemo(() => groups.map((group) => ({ id: group.id, name: group.name, level: group.level })), [groups]);

  const handleCompleted = (result: PlanActionResult) => {
    setFeedback({
      tone: result.success ? "success" : "error",
      message: result.message
    });

    if (result.success) {
      setFormOpen(false);
      setSelectedPlan(null);
    }
  };

  const openCreatePlan = () => {
    setSelectedPlan(null);
    setFormOpen(true);
  };

  const openEditPlan = (plan: PlanRecord) => {
    setSelectedPlan(plan);
    setFormOpen(true);
  };

  const openViewPlan = (plan: PlanRecord) => {
    setSelectedPlan(plan);
    setDetailsOpen(true);
  };

  const handleDuplicatePlan = (planId: string) => {
    startDuplicateTransition(async () => {
      const result = await duplicatePlanAction(planId);
      handleCompleted(result);
    });
  };

  const handleDeletePlan = (plan: PlanRecord) => {
    if (!window.confirm(`Se eliminará el plan "${plan.title}". ¿Quieres continuar?`)) {
      return;
    }

    startDeleteTransition(async () => {
      const result = await deletePlanAction(plan.id);
      handleCompleted(result);
    });
  };

  return (
    <section className="space-y-6">
      <ModuleHeader
        title="Módulo de Planes"
        subtitle="Diseña, organiza y administra tus planes con datos reales del sistema."
        actions={
          <button
            type="button"
            onClick={openCreatePlan}
            disabled={groups.length === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <PlusCircle className="h-4 w-4" />
            Crear nuevo plan
          </button>
        }
      />

      {feedback ? (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            feedback.tone === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
              : "border-rose-500/30 bg-rose-500/10 text-rose-200"
          }`}
        >
          {feedback.message}
        </div>
      ) : null}

      {groups.length === 0 ? (
        <EmptyState
          icon={PlusCircle}
          title="Primero crea un grupo para planificar"
          description="Tus planes deben asociarse a uno de tus grupos reales. Cuando tengas grupos, podrás crear planes desde aquí."
        />
      ) : !plans.length ? (
        <EmptyState
          icon={PlusCircle}
          title="Aún no has creado planes"
          description="Comienza con tu primer plan y deja lista la base para actividades y resultados."
          action={
            <button
              type="button"
              onClick={openCreatePlan}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-white/15 dark:text-slate-200 dark:hover:bg-white/10"
            >
              Crear primer plan
            </button>
          }
        />
      ) : (
        <div className="grid gap-3">
          {plans.map((plan) => {
            const relatedGroup = Array.isArray(plan.groups) ? plan.groups[0] : plan.groups;

            return (
              <Card key={plan.id} className="glass-card-plus p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <h2 className="text-lg font-bold tracking-tight">{plan.title}</h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {relatedGroup?.name ?? "Sin grupo"} · {plan.subject} · {plan.duration_minutes} min · {new Date(plan.created_at).toLocaleDateString("es-CO")}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[plan.status] ?? statusStyles.draft}`}>
                        {getPlanStatusLabel(plan.status)}
                      </span>
                      <span className="inline-flex rounded-full border border-white/10 px-2.5 py-1 text-xs font-semibold text-slate-300">
                        {getEvaluationTypeLabel(plan.evaluation_type)}
                      </span>
                      <span className="inline-flex rounded-full border border-white/10 px-2.5 py-1 text-xs font-semibold text-slate-300">{plan.topic}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => openViewPlan(plan)}
                      className="rounded-lg border border-slate-300 p-2 hover:bg-slate-100 dark:border-white/10 dark:hover:bg-white/10"
                      aria-label="Ver plan"
                      title="Ver plan"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditPlan(plan)}
                      className="rounded-lg border border-slate-300 p-2 hover:bg-slate-100 dark:border-white/10 dark:hover:bg-white/10"
                      aria-label="Editar plan"
                      title="Editar plan"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDuplicatePlan(plan.id)}
                      disabled={isDuplicating}
                      className="rounded-lg border border-slate-300 p-2 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:hover:bg-white/10"
                      aria-label="Duplicar plan"
                      title="Duplicar plan"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePlan(plan)}
                      disabled={isDeleting}
                      className="rounded-lg border border-rose-500/30 p-2 text-rose-300 hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                      aria-label="Eliminar plan"
                      title="Eliminar plan"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <PlanFormDialog
        isOpen={formOpen}
        groups={groupedOptions}
        plan={selectedPlan}
        onClose={() => {
          setFormOpen(false);
          setSelectedPlan(null);
        }}
        onCompleted={handleCompleted}
        createPlanAction={createPlanAction}
        updatePlanAction={updatePlanAction}
      />

      <PlanDetailsDialog
        isOpen={detailsOpen}
        plan={selectedPlan}
        onClose={() => {
          setDetailsOpen(false);
          setSelectedPlan(null);
        }}
      />
    </section>
  );
};
