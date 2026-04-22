"use client";

import { Copy, Eye, Pencil, PlusCircle, Sparkles, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";

import { DocumentExportMenu } from "@/components/pdf/document-export-menu";
import { EmptyState } from "@/components/ui/empty-state";
import { Card } from "@/components/ui/card";
import { ModuleHeader } from "@/components/ui/module-header";
import { ToastMessage } from "@/components/ui/toast-message";
import { createPlanAction, deletePlanAction, duplicatePlanAction, type PlanActionResult, updatePlanAction } from "@/features/plans/actions";
import { PlanAIDialog } from "@/features/plans/plan-ai-dialog";
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
  plan_json?: Record<string, unknown> | null;
  groups: { name: string; level: string | null } | { name: string; level: string | null }[] | null;
};

type FeedbackState = {
  tone: "success" | "error";
  message: string;
} | null;

const statusStyles: Record<string, string> = {
  draft: "border border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
  ready: "border border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-900/30 dark:text-emerald-300",
  archived: "border border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-900/30 dark:text-amber-300"
};

type PlansPanelProps = {
  groups: GroupOption[];
  plans: PlanRecord[];
  initialAIOpen?: boolean;
};

export const PlansPanel = ({ groups, plans, initialAIOpen = false }: PlansPanelProps) => {
  const router = useRouter();
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [toast, setToast] = useState<{ tone: "success" | "warning"; message: string } | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [isDuplicating, startDuplicateTransition] = useTransition();
  const [formOpen, setFormOpen] = useState(false);
  const [aiOpen, setAIOpen] = useState(initialAIOpen);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanRecord | null>(null);
  const [aiPlan, setAIPlan] = useState<PlanRecord | null>(null);

  const groupedOptions = useMemo(() => groups.map((group) => ({ id: group.id, name: group.name, level: group.level })), [groups]);

  useEffect(() => {
    if (initialAIOpen) {
      setAIOpen(true);
    }
  }, [initialAIOpen]);

  const handleCompleted = (result: PlanActionResult) => {
    setFeedback({
      tone: result.success ? "success" : "error",
      message: result.message
    });

    if (result.success) {
      setFormOpen(false);
      setSelectedPlan(null);
      router.refresh();
    }
  };

  const openCreatePlan = () => {
    setSelectedPlan(null);
    setFormOpen(true);
  };

  const openAICreatePlan = () => {
    setAIPlan(null);
    setAIOpen(true);
  };

  const openEditPlan = (plan: PlanRecord) => {
    setSelectedPlan(plan);
    setFormOpen(true);
  };

  const openImprovePlan = (plan: PlanRecord) => {
    setAIPlan(plan);
    setAIOpen(true);
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
      {toast ? <ToastMessage message={toast.message} tone={toast.tone} onClose={() => setToast(null)} /> : null}

      <ModuleHeader
        title="Planes"
        subtitle="Diseña, organiza y administra tus planes de trabajo."
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={openAICreatePlan}
              disabled={groups.length === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 transition hover:-translate-y-0.5 hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-violet-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Sparkles className="h-4 w-4" />
              Generar plan con IA
            </button>
            <button
              type="button"
              onClick={openCreatePlan}
              disabled={groups.length === 0}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300/90 bg-white/92 px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.24)] transition hover:border-slate-400 hover:bg-white focus:outline-none focus:ring-4 focus:ring-violet-500/12 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700/80 dark:bg-slate-900/85 dark:text-slate-100 dark:shadow-[0_16px_34px_-26px_rgba(0,0,0,0.58)] dark:hover:border-slate-600 dark:hover:bg-slate-900"
            >
              <PlusCircle className="h-4 w-4" />
              Crear nuevo plan
            </button>
          </div>
        }
      />

      {feedback ? (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            feedback.tone === "success"
              ? "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200"
              : "border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200"
          }`}
        >
          {feedback.message}
        </div>
      ) : null}

      {groups.length === 0 ? (
        <EmptyState
          icon={PlusCircle}
          title="Primero crea un grupo para planificar"
          description="Cada plan debe asociarse a un grupo. Cuando tengas uno disponible, podrás crearlo manualmente o generar una propuesta con IA."
        />
      ) : !plans.length ? (
        <EmptyState
          icon={PlusCircle}
          title="Aún no has creado planes"
          description="Crea tu primer plan o genera una propuesta con IA para organizar actividades, resultados y seguimiento del curso."
          action={
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={openAICreatePlan}
                className="rounded-lg bg-gradient-to-r from-violet-500 to-indigo-500 px-3 py-2 text-sm font-medium text-white transition hover:brightness-110"
              >
                Generar con IA
              </button>
              <button
                type="button"
                onClick={openCreatePlan}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-white/15 dark:text-slate-200 dark:hover:bg-white/10"
              >
                Crear primer plan
              </button>
            </div>
          }
        />
      ) : (
        <div className="grid gap-3">
          {plans.map((plan) => {
            const relatedGroup = Array.isArray(plan.groups) ? plan.groups[0] : plan.groups;

            return (
              <Card key={plan.id} className="glass-card-plus p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="space-y-1.5">
                      <h2 className="text-lg font-bold tracking-tight text-slate-950 dark:text-slate-50">{plan.title}</h2>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        {relatedGroup?.name ?? "Sin grupo"} · {plan.subject} · {plan.duration_minutes} min · {new Date(plan.created_at).toLocaleDateString("es-CO")}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[plan.status] ?? statusStyles.draft}`}>
                        {getPlanStatusLabel(plan.status)}
                      </span>
                      <span className="inline-flex rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-800 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-200">
                        {getEvaluationTypeLabel(plan.evaluation_type)}
                      </span>
                      <span className="inline-flex rounded-full border border-slate-300 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">{plan.topic}</span>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                    <DocumentExportMenu pdfEndpoint={`/api/export/plans/${plan.id}`} wordEndpoint={`/api/export/plans/${plan.id}/word`} />
                    <button
                      type="button"
                      onClick={() => openImprovePlan(plan)}
                      className="rounded-xl border border-violet-300 bg-violet-50 p-2.5 text-violet-700 transition hover:bg-violet-100 focus:outline-none focus:ring-4 focus:ring-violet-500/12 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-200 dark:hover:bg-violet-500/14"
                      aria-label="Mejorar con IA"
                      title="Mejorar con IA"
                    >
                      <Sparkles className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => openViewPlan(plan)}
                      className="rounded-xl border border-slate-300 bg-white p-2.5 text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-violet-500/12 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                      aria-label="Ver plan"
                      title="Ver plan"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditPlan(plan)}
                      className="rounded-xl border border-slate-300 bg-white p-2.5 text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-violet-500/12 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                      aria-label="Editar plan"
                      title="Editar plan"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDuplicatePlan(plan.id)}
                      disabled={isDuplicating}
                      className="rounded-xl border border-slate-300 bg-white p-2.5 text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-violet-500/12 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                      aria-label="Duplicar plan"
                      title="Duplicar plan"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePlan(plan)}
                      disabled={isDeleting}
                      className="rounded-xl border border-rose-300 bg-rose-50 p-2.5 text-rose-700 transition hover:bg-rose-100 focus:outline-none focus:ring-4 focus:ring-rose-500/12 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/14"
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

      <PlanAIDialog
        isOpen={aiOpen}
        groups={groupedOptions}
        plan={aiPlan}
        onClose={() => {
          setAIOpen(false);
          setAIPlan(null);
        }}
        onCompleted={(result) => {
          handleCompleted(result);

          if (result.success) {
            setToast({
              tone: "success",
              message: result.message
            });
            setAIOpen(false);
            setAIPlan(null);
          } else {
            setToast({
              tone: "warning",
              message: result.message
            });
          }
        }}
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
