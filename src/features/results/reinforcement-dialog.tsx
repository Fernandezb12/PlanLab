"use client";

import { LoaderCircle, Save } from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";

import { Modal } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import { ToastMessage } from "@/components/ui/toast-message";
import { createPlanAction, type PlanActionResult } from "@/features/plans/actions";
import { generateReinforcementAIAction } from "@/features/results/ai-actions";
import { type GenerateReinforcementInput, type ReinforcementPlanAI, reinforcementAISchema } from "@/lib/validations/ai";
import { type PlanInput } from "@/lib/validations/plans";

type ReinforcementDialogProps = {
  isOpen: boolean;
  input: GenerateReinforcementInput | null;
  onClose: () => void;
  onCompleted?: (result: PlanActionResult) => void;
};

const buildPlanInputFromReinforcement = (input: GenerateReinforcementInput, strategy: ReinforcementPlanAI): PlanInput => ({
  groupId: input.groupId,
  title: `Refuerzo: ${input.topic}`,
  subject: input.subject,
  topic: `${input.topic} · Refuerzo`,
  durationMinutes: input.durationMinutes,
  objective: strategy.objective_refuerzo,
  resources: strategy.recursos,
  evaluationType: "formativa",
  status: "ready",
  planJson: {
    title: `Refuerzo: ${input.topic}`,
    subject: input.subject,
    topic: `${input.topic} · Refuerzo`,
    duration_minutes: input.durationMinutes,
    objective: strategy.objective_refuerzo,
    resources: strategy.recursos,
    evaluation_type: "formativa",
    status: "ready",
    inicio: strategy.inicio,
    desarrollo: strategy.desarrollo,
    cierre: strategy.cierre,
    distribucion_tiempo: strategy.distribucion_tiempo,
    refuerzo: {
      breve_diagnostico: strategy.breve_diagnostico,
      criterio_evaluacion: strategy.criterio_evaluacion,
      recomendaciones_docente: strategy.recomendaciones_docente
    }
  }
});

export const ReinforcementDialog = ({ isOpen, input, onClose, onCompleted }: ReinforcementDialogProps) => {
  const [isGenerating, startGenerating] = useTransition();
  const [isSaving, startSaving] = useTransition();
  const [strategy, setStrategy] = useState<ReinforcementPlanAI | null>(null);
  const [toast, setToast] = useState<{ tone: "success" | "warning"; message: string } | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const dialogTitle = useMemo(() => (input ? `Refuerzo para ${input.groupName}` : "Generar refuerzo"), [input]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setStrategy(null);
    setToast(null);
    setSaveError(null);
  }, [isOpen, input]);

  useEffect(() => {
    if (!isOpen || !input) {
      return;
    }

    startGenerating(async () => {
      const result = await generateReinforcementAIAction(input);

      if (!result.success) {
        setToast({
          tone: "warning",
          message: result.message || "No fue posible generar el contenido en este intento. Intenta nuevamente."
        });
        return;
      }

      setStrategy(result.strategy);
    });
  }, [input, isOpen]);

  const fallbackCopyText = (value: string) => {
    if (typeof document === "undefined") {
      return false;
    }

    const textArea = document.createElement("textarea");
    textArea.value = value;
    textArea.setAttribute("readonly", "");
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    textArea.style.pointerEvents = "none";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      return document.execCommand("copy");
    } catch (error) {
      console.error("Error real en fallback de copiado:", error);
      return false;
    } finally {
      document.body.removeChild(textArea);
    }
  };

  const handleCopy = async () => {
    if (!strategy) {
      return;
    }

    const payload = [
      `Objetivo de refuerzo: ${strategy.objective_refuerzo}`,
      `Diagnóstico: ${strategy.breve_diagnostico}`,
      `Inicio: ${strategy.inicio}`,
      `Desarrollo: ${strategy.desarrollo}`,
      `Cierre: ${strategy.cierre}`,
      `Recursos: ${strategy.recursos}`,
      `Criterio de evaluación: ${strategy.criterio_evaluacion}`,
      `Recomendaciones docentes: ${strategy.recomendaciones_docente}`
    ].join("\n\n");

    try {
      let copied = false;

      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(payload);
          copied = true;
        } catch (error) {
          console.error("Error real usando Clipboard API:", error);
        }
      }

      if (!copied) {
        copied = fallbackCopyText(payload);
      }

      if (!copied) {
        throw new Error("copy_failed");
      }

      setToast({
        tone: "success",
        message: "La estrategia se copió al portapapeles."
      });
    } catch (error) {
      console.error("Error real copiando estrategia de refuerzo:", error);
      setToast({
        tone: "warning",
        message: "No fue posible copiar el contenido en este intento."
      });
    }
  };

  const handleConvertToPlan = () => {
    if (!input || !strategy) {
      return;
    }

    const parsedStrategy = reinforcementAISchema.safeParse(strategy);

    if (!parsedStrategy.success) {
      setSaveError("La estrategia generada necesita revisión antes de convertirse en plan.");
      return;
    }

    startSaving(async () => {
      const result = await createPlanAction(buildPlanInputFromReinforcement(input, parsedStrategy.data));

      if (!result.success) {
        setSaveError(result.message);
      } else {
        setSaveError(null);
        setToast({
          tone: "success",
          message: "La estrategia se convirtió en un nuevo plan de apoyo."
        });
      }

      onCompleted?.(result);
    });
  };

  return (
    <>
      {toast ? <ToastMessage message={toast.message} tone={toast.tone} onClose={() => setToast(null)} /> : null}

      <Modal
        isOpen={isOpen}
        onClose={() => {
          if (!isGenerating && !isSaving) {
            onClose();
          }
        }}
        title={dialogTitle}
        description="La propuesta se genera desde resultados reales y queda lista para revisión docente."
        contentClassName="max-w-5xl max-h-[88vh] p-0"
        bodyClassName="min-h-0 flex-1 p-0"
      >
        <div className="flex h-[78vh] max-h-[78vh] min-h-0 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            {isGenerating ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-44" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : strategy ? (
              <div className="space-y-4">
                <div className="rounded-[24px] border border-violet-300/40 bg-violet-50 p-4 dark:border-violet-500/20 dark:bg-violet-500/10">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-700 dark:text-violet-200">Propuesta de apoyo</p>
                  <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                    Revisa la estrategia completa y úsala como base para un nuevo plan de apoyo o cópiala para trabajarla después.
                  </p>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">Objetivo de refuerzo</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">{strategy.objective_refuerzo}</p>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">Diagnóstico breve</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">{strategy.breve_diagnostico}</p>
                </div>

                <div className="grid gap-4 xl:grid-cols-3">
                  <div className="rounded-[24px] border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
                    <p className="text-sm font-semibold text-slate-950 dark:text-white">Inicio</p>
                    <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">{strategy.inicio}</p>
                  </div>
                  <div className="rounded-[24px] border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
                    <p className="text-sm font-semibold text-slate-950 dark:text-white">Desarrollo</p>
                    <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">{strategy.desarrollo}</p>
                  </div>
                  <div className="rounded-[24px] border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
                    <p className="text-sm font-semibold text-slate-950 dark:text-white">Cierre</p>
                    <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">{strategy.cierre}</p>
                  </div>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">Distribución del tiempo</p>
                  <div className="mt-4 grid gap-4 md:grid-cols-3">
                    {[
                      { label: "Inicio", value: strategy.distribucion_tiempo.inicio },
                      { label: "Desarrollo", value: strategy.distribucion_tiempo.desarrollo },
                      { label: "Cierre", value: strategy.distribucion_tiempo.cierre }
                    ].map((item) => (
                      <div key={item.label} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-slate-900/70">
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-500">{item.label}</p>
                        <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">{item.value} min</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                  <div className="rounded-[24px] border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
                    <p className="text-sm font-semibold text-slate-950 dark:text-white">Recursos</p>
                    <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">{strategy.recursos}</p>
                  </div>
                  <div className="rounded-[24px] border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
                    <p className="text-sm font-semibold text-slate-950 dark:text-white">Criterio de evaluación</p>
                    <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">{strategy.criterio_evaluacion}</p>
                  </div>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">Recomendaciones docentes</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">{strategy.recomendaciones_docente}</p>
                </div>
              </div>
            ) : (
              <div className="rounded-[24px] border border-slate-200 bg-slate-50/90 p-6 text-sm text-slate-700 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300">
                No fue posible generar una estrategia en este intento.
              </div>
            )}
          </div>

          <div className="shrink-0 border-t border-slate-200 bg-white/96 px-6 py-4 shadow-[0_-18px_40px_-28px_rgba(15,23,42,0.12)] backdrop-blur-md dark:border-white/10 dark:bg-slate-950/95 dark:shadow-[0_-18px_40px_-28px_rgba(0,0,0,0.75)]">
            <div className="flex flex-wrap items-center justify-end gap-3">
              {saveError ? <p className="mr-auto text-sm text-rose-400">{saveError}</p> : null}
              <button
                type="button"
                onClick={onClose}
                disabled={isGenerating || isSaving}
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={handleCopy}
                disabled={!strategy}
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
              >
                Copiar estrategia
              </button>
              <button
                type="button"
                onClick={handleConvertToPlan}
                disabled={isSaving || !strategy}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Usar como base para un plan
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};
