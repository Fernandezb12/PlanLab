"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Save, Sparkles, Wand2 } from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { Modal } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import { ToastMessage } from "@/components/ui/toast-message";
import { createPlanAction, type PlanActionResult, updatePlanAction } from "@/features/plans/actions";
import { generatePlanWithAIAction, improvePlanWithAIAction } from "@/features/plans/ai-actions";
import { evaluationTypeLabels, evaluationTypes, normalizeEvaluationType, type PlanInput } from "@/lib/validations/plans";
import {
  generatePlanAIInputSchema,
  lessonPlanAISchema,
  type GeneratePlanAIInput,
  type LessonPlanAI
} from "@/lib/validations/ai";

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
  plan_json?: Record<string, unknown> | null;
};

type PlanAIDialogProps = {
  isOpen: boolean;
  groups: GroupOption[];
  plan?: PlanRecord | null;
  onClose: () => void;
  onCompleted: (result: PlanActionResult) => void;
};

const buildDefaultPromptValues = (groups: GroupOption[], plan?: PlanRecord | null): GeneratePlanAIInput => {
  const fallbackGroupId = plan?.group_id ?? groups[0]?.id ?? "";
  const selectedGroup = groups.find((group) => group.id === fallbackGroupId);
  const existingJson = plan?.plan_json;

  return {
    groupId: fallbackGroupId,
    groupName: selectedGroup?.name ?? "",
    educationLevel: selectedGroup?.level ?? "",
    subject: plan?.subject ?? "",
    topic: plan?.topic ?? "",
    durationMinutes: plan?.duration_minutes ?? 45,
    objective: plan?.objective ?? "",
    evaluationType: normalizeEvaluationType(plan?.evaluation_type) ?? "formativa",
    resources: plan?.resources ?? "",
    context: "",
    existingPlanId: plan?.id,
    existingPlanTitle: plan?.title ?? "",
    existingPlanJson: existingJson && typeof existingJson === "object" ? lessonPlanAISchema.partial().safeParse(existingJson).data ?? null : null
  };
};

const emptyGeneratedPlan = (values: GeneratePlanAIInput): LessonPlanAI => ({
  title: values.topic ? `Plan de clase: ${values.topic}` : "",
  subject: values.subject,
  topic: values.topic,
  duration_minutes: values.durationMinutes,
  objective: values.objective,
  evaluation_type: values.evaluationType,
  resources: values.resources || "",
  inicio: "",
  desarrollo: "",
  cierre: "",
  distribucion_tiempo: {
    inicio: Math.max(5, Math.round(values.durationMinutes * 0.2)),
    desarrollo: Math.max(10, Math.round(values.durationMinutes * 0.6)),
    cierre: Math.max(5, values.durationMinutes - Math.max(5, Math.round(values.durationMinutes * 0.2)) - Math.max(10, Math.round(values.durationMinutes * 0.6)))
  },
  observaciones_docente: "",
  sugerencias_metodologicas: ""
});

const fieldLabelClassName = "text-sm font-medium text-slate-800 dark:text-slate-200";
const fieldInputClassName =
  "w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white";
const fieldSelectClassName =
  "w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 dark:border-white/10 dark:bg-slate-900 dark:text-white";

const buildPlanInput = (values: GeneratePlanAIInput, generatedPlan: LessonPlanAI, plan?: PlanRecord | null): PlanInput => ({
  id: plan?.id,
  groupId: values.groupId,
  title: generatedPlan.title,
  subject: generatedPlan.subject,
  topic: generatedPlan.topic,
  durationMinutes: generatedPlan.duration_minutes,
  objective: generatedPlan.objective,
  resources: generatedPlan.resources,
  evaluationType: generatedPlan.evaluation_type,
  status: "ready",
  planJson: {
    ...generatedPlan,
    resources: generatedPlan.resources,
    status: "ready",
    generated_with_ai: true,
    ai_mode: plan ? "improved" : "generated"
  }
});

export const PlanAIDialog = ({ isOpen, groups, plan, onClose, onCompleted }: PlanAIDialogProps) => {
  const [isGenerating, startGenerateTransition] = useTransition();
  const [isSaving, startSaveTransition] = useTransition();
  const [toast, setToast] = useState<{ tone: "warning" | "success"; message: string } | null>(null);
  const [generatedPlan, setGeneratedPlan] = useState<LessonPlanAI | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const defaultValues = useMemo(() => buildDefaultPromptValues(groups, plan), [groups, plan]);

  const promptForm = useForm<GeneratePlanAIInput>({
    resolver: zodResolver(generatePlanAIInputSchema),
    defaultValues
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    promptForm.reset(defaultValues);
    setGeneratedPlan(null);
    setSaveError(null);
    setToast(null);
  }, [defaultValues, isOpen, promptForm]);

  const selectedGroup = groups.find((group) => group.id === promptForm.watch("groupId"));

  useEffect(() => {
    if (!selectedGroup) {
      return;
    }

    promptForm.setValue("groupName", selectedGroup.name, { shouldValidate: false });
    promptForm.setValue("educationLevel", selectedGroup.level ?? "", { shouldValidate: false });
  }, [promptForm, selectedGroup]);

  const runGeneration = promptForm.handleSubmit((values) => {
    setSaveError(null);
    setToast(null);

    startGenerateTransition(async () => {
      const action = plan ? improvePlanWithAIAction : generatePlanWithAIAction;
      const result = await action(values);

      if (!result.success) {
        setToast({
          tone: "warning",
          message: result.message || "No fue posible generar el plan en este intento. Intenta nuevamente."
        });
        return;
      }

      setGeneratedPlan(result.plan);
      setToast({
        tone: "success",
        message: plan ? "Se generó una propuesta mejorada del plan." : "Se generó una propuesta de plan con IA."
      });
    });
  });

  const handleGeneratedPlanChange = <K extends keyof LessonPlanAI>(field: K, value: LessonPlanAI[K]) => {
    setGeneratedPlan((current) => {
      const base = current ?? emptyGeneratedPlan(promptForm.getValues());
      return {
        ...base,
        [field]: value
      };
    });
  };

  const handleDistributionChange = (field: keyof LessonPlanAI["distribucion_tiempo"], value: number) => {
    setGeneratedPlan((current) => {
      const base = current ?? emptyGeneratedPlan(promptForm.getValues());
      return {
        ...base,
        distribucion_tiempo: {
          ...base.distribucion_tiempo,
          [field]: Number.isFinite(value) ? Math.max(1, value) : 1
        }
      };
    });
  };

  const handleSave = async () => {
    const promptValues = promptForm.getValues();
    const parsedPlan = lessonPlanAISchema.safeParse(generatedPlan);

    if (!parsedPlan.success) {
      setSaveError("Revisa la propuesta generada antes de guardarla.");
      return;
    }

    startSaveTransition(async () => {
      const payload = buildPlanInput(promptValues, parsedPlan.data, plan);
      const result = plan ? await updatePlanAction(payload) : await createPlanAction(payload);

      if (!result.success) {
        setSaveError(result.message);
      } else {
        setGeneratedPlan(null);
        setSaveError(null);
      }

      onCompleted(result);
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
        title={plan ? "Mejorar plan con IA" : "Generar plan con IA"}
        description="Completa la información pedagógica y revisa la propuesta antes de guardarla."
        contentClassName="max-w-6xl max-h-[88vh] overflow-hidden p-0"
        bodyClassName="min-h-0 flex-1 p-0"
      >
        <div className="flex h-[88vh] max-h-[88vh] min-h-0 flex-col">
          <div className="grid min-h-0 flex-1 gap-0 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="min-h-0 overflow-y-auto border-b border-slate-200 px-6 py-5 lg:border-b-0 lg:border-r dark:border-white/10">
              <form className="space-y-5" onSubmit={runGeneration}>
                <div className="rounded-[26px] border border-slate-200 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-white/[0.04]">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-2xl bg-violet-500/15 text-violet-200">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-950 dark:text-white">Contexto base de la clase</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Define la información base para recibir una propuesta alineada con el grupo y el propósito de la clase.</p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className={fieldLabelClassName}>Grupo</label>
                      <select className={fieldSelectClassName} {...promptForm.register("groupId")}>
                        <option value="">Selecciona un grupo</option>
                        {groups.map((group) => (
                          <option key={group.id} value={group.id}>
                            {group.name} {group.level ? `· ${group.level}` : ""}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-rose-400">{promptForm.formState.errors.groupId?.message}</p>
                    </div>

                    <div className="space-y-2">
                      <label className={fieldLabelClassName}>Tipo de evaluación</label>
                      <select className={fieldSelectClassName} {...promptForm.register("evaluationType")}>
                        {evaluationTypes.map((evaluationType) => (
                          <option key={evaluationType} value={evaluationType}>
                            {evaluationTypeLabels[evaluationType]}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-rose-400">{promptForm.formState.errors.evaluationType?.message}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className={fieldLabelClassName}>Área</label>
                      <input className={fieldInputClassName} placeholder="Ciencias Naturales" {...promptForm.register("subject")} />
                      <p className="text-xs text-rose-400">{promptForm.formState.errors.subject?.message}</p>
                    </div>

                    <div className="space-y-2">
                      <label className={fieldLabelClassName}>Tema</label>
                      <input className={fieldInputClassName} placeholder="Relaciones tróficas" {...promptForm.register("topic")} />
                      <p className="text-xs text-rose-400">{promptForm.formState.errors.topic?.message}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-[180px_1fr]">
                    <div className="space-y-2">
                      <label className={fieldLabelClassName}>Duración</label>
                      <input
                        type="number"
                        min={10}
                        max={240}
                        className={fieldInputClassName}
                        {...promptForm.register("durationMinutes", { valueAsNumber: true })}
                      />
                      <p className="text-xs text-rose-400">{promptForm.formState.errors.durationMinutes?.message}</p>
                    </div>

                    <div className="space-y-2">
                      <label className={fieldLabelClassName}>Recursos</label>
                      <input className={fieldInputClassName} placeholder="Guía, material manipulativo, video o laboratorio" {...promptForm.register("resources")} />
                      <p className="text-xs text-rose-400">{promptForm.formState.errors.resources?.message}</p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <label className={fieldLabelClassName}>Objetivo de la clase</label>
                    <textarea
                      rows={4}
                      className={fieldInputClassName}
                      placeholder="Describe con claridad qué se espera lograr en la sesión."
                      {...promptForm.register("objective")}
                    />
                    <p className="text-xs text-rose-400">{promptForm.formState.errors.objective?.message}</p>
                  </div>

                  <div className="mt-4 space-y-2">
                    <label className={fieldLabelClassName}>Contexto adicional</label>
                    <textarea
                      rows={4}
                      className={fieldInputClassName}
                      placeholder="Necesidades del grupo, enfoque metodológico o consideraciones institucionales."
                      {...promptForm.register("context")}
                    />
                    <p className="text-xs text-slate-500">Este campo es opcional y ayuda a ajustar mejor la propuesta.</p>
                  </div>

                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isGenerating ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                    {generatedPlan ? "Regenerar propuesta" : plan ? "Mejorar propuesta" : "Generar propuesta"}
                  </button>
                </div>
              </form>
            </div>

            <div className="min-h-0 overflow-y-auto px-6 py-5">
              {isGenerating ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-40 w-full" />
                </div>
              ) : generatedPlan ? (
                <div className="space-y-5">
                    <div className="rounded-[26px] border border-violet-300/40 bg-violet-50 p-4 dark:border-violet-500/20 dark:bg-violet-500/10">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-700 dark:text-violet-200">Propuesta revisable</p>
                      <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">Revisa y ajusta la propuesta antes de aplicarla al plan de clase.</p>
                    </div>

                  <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Propuesta sugerida por IA</p>
                    <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">Esta versión se guardará en el plan y será la base para exportaciones y vista previa.</p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className={fieldLabelClassName}>Título</label>
                      <input
                        value={generatedPlan.title}
                        onChange={(event) => handleGeneratedPlanChange("title", event.target.value)}
                        className={fieldInputClassName}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className={fieldLabelClassName}>Área</label>
                      <input
                        value={generatedPlan.subject}
                        onChange={(event) => handleGeneratedPlanChange("subject", event.target.value)}
                        className={fieldInputClassName}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-[1fr_180px]">
                    <div className="space-y-2">
                      <label className={fieldLabelClassName}>Tema</label>
                      <input
                        value={generatedPlan.topic}
                        onChange={(event) => handleGeneratedPlanChange("topic", event.target.value)}
                        className={fieldInputClassName}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className={fieldLabelClassName}>Duración</label>
                      <input
                        type="number"
                        min={10}
                        max={240}
                        value={generatedPlan.duration_minutes}
                        onChange={(event) => handleGeneratedPlanChange("duration_minutes", Number(event.target.value))}
                        className={fieldInputClassName}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className={fieldLabelClassName}>Objetivo</label>
                    <textarea
                      rows={3}
                      value={generatedPlan.objective}
                      onChange={(event) => handleGeneratedPlanChange("objective", event.target.value)}
                      className={fieldInputClassName}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className={fieldLabelClassName}>Recursos</label>
                    <textarea
                      rows={2}
                      value={generatedPlan.resources}
                      onChange={(event) => handleGeneratedPlanChange("resources", event.target.value)}
                      className={fieldInputClassName}
                    />
                  </div>

                  <div className="grid gap-4 xl:grid-cols-3">
                    <div className="space-y-2">
                      <label className={fieldLabelClassName}>Inicio</label>
                      <textarea
                        rows={6}
                        value={generatedPlan.inicio}
                        onChange={(event) => handleGeneratedPlanChange("inicio", event.target.value)}
                        className={fieldInputClassName}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className={fieldLabelClassName}>Desarrollo</label>
                      <textarea
                        rows={6}
                        value={generatedPlan.desarrollo}
                        onChange={(event) => handleGeneratedPlanChange("desarrollo", event.target.value)}
                        className={fieldInputClassName}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className={fieldLabelClassName}>Cierre</label>
                      <textarea
                        rows={6}
                        value={generatedPlan.cierre}
                        onChange={(event) => handleGeneratedPlanChange("cierre", event.target.value)}
                        className={fieldInputClassName}
                      />
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                    <p className="text-sm font-semibold text-slate-950 dark:text-white">Distribución del tiempo</p>
                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                      <div className="space-y-2">
                        <label className="text-sm text-slate-600 dark:text-slate-300">Inicio</label>
                        <input
                          type="number"
                          min={1}
                          value={generatedPlan.distribucion_tiempo.inicio}
                          onChange={(event) => handleDistributionChange("inicio", Number(event.target.value))}
                          className={fieldInputClassName}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-slate-600 dark:text-slate-300">Desarrollo</label>
                        <input
                          type="number"
                          min={1}
                          value={generatedPlan.distribucion_tiempo.desarrollo}
                          onChange={(event) => handleDistributionChange("desarrollo", Number(event.target.value))}
                          className={fieldInputClassName}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-slate-600 dark:text-slate-300">Cierre</label>
                        <input
                          type="number"
                          min={1}
                          value={generatedPlan.distribucion_tiempo.cierre}
                          onChange={(event) => handleDistributionChange("cierre", Number(event.target.value))}
                          className={fieldInputClassName}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 xl:grid-cols-2">
                    <div className="space-y-2">
                      <label className={fieldLabelClassName}>Observaciones docentes</label>
                      <textarea
                        rows={4}
                        value={generatedPlan.observaciones_docente ?? ""}
                        onChange={(event) => handleGeneratedPlanChange("observaciones_docente", event.target.value)}
                        className={fieldInputClassName}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className={fieldLabelClassName}>Sugerencias metodológicas</label>
                      <textarea
                        rows={4}
                        value={generatedPlan.sugerencias_metodologicas ?? ""}
                        onChange={(event) => handleGeneratedPlanChange("sugerencias_metodologicas", event.target.value)}
                        className={fieldInputClassName}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid h-full min-h-[420px] place-items-center rounded-[30px] border border-dashed border-slate-300 bg-slate-50/80 px-8 text-center dark:border-white/10 dark:bg-white/[0.02]">
                  <div className="max-w-md space-y-3">
                    <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-violet-500/15 text-violet-200">
                      <Sparkles className="h-7 w-7" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-950 dark:text-white">{plan ? "Propuesta de mejora del plan" : "Propuesta de plan asistida por IA"}</h3>
                    <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
                      Completa el contexto pedagógico y genera una propuesta estructurada para revisarla antes de guardarla.
                    </p>
                  </div>
                </div>
              )}
            </div>
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
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!generatedPlan || isGenerating || isSaving}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {plan ? "Aplicar propuesta al plan" : "Guardar plan"}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};
