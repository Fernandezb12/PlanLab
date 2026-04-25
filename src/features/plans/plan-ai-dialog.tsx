"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Save, Sparkles, Wand2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { Modal } from "@/components/ui/modal";
import { Combobox } from "@/components/ui/combobox";
import { Skeleton } from "@/components/ui/skeleton";
import { ToastMessage } from "@/components/ui/toast-message";
import { createPlanAction, type PlanActionResult, updatePlanAction } from "@/features/plans/actions";
import { generatePlanWithAIAction, improvePlanWithAIAction } from "@/features/plans/ai-actions";
import { getSubjectOptionsForLevel, isPreschoolLevel } from "@/lib/constants/education";
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
  subject: string | null;
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
    subject: plan?.subject ?? selectedGroup?.subject ?? "",
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
  momentos: [],
  criterio_evaluacion: "",
  recursos_sugeridos: values.resources ? [values.resources] : [],
  observaciones_docente: "",
  observaciones_docentes: "",
  sugerencias_metodologicas: ""
});

const fieldLabelClassName = "text-sm font-medium text-slate-800 dark:text-slate-200";
const fieldInputClassName =
  "w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white";
const fieldSelectClassName =
  "w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 dark:border-white/10 dark:bg-slate-900 dark:text-white";
const proposalCardClassName =
  "rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-900/75";
const proposalTextareaClassName =
  "w-full resize-y rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 dark:border-white/10 dark:bg-slate-950/70 dark:text-white";

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

const hasRequiredGeneratedContent = (plan: LessonPlanAI | null) => {
  if (!plan) {
    return false;
  }

  return Boolean(
    plan.objective.trim() &&
      plan.resources.trim() &&
      plan.inicio.trim() &&
      plan.desarrollo.trim() &&
      plan.cierre.trim() &&
      plan.distribucion_tiempo &&
      Number.isFinite(plan.distribucion_tiempo.inicio) &&
      Number.isFinite(plan.distribucion_tiempo.desarrollo) &&
      Number.isFinite(plan.distribucion_tiempo.cierre)
  );
};

export const PlanAIDialog = ({ isOpen, groups, plan, onClose, onCompleted }: PlanAIDialogProps) => {
  const [isGenerating, startGenerateTransition] = useTransition();
  const [isSaving, startSaveTransition] = useTransition();
  const [toast, setToast] = useState<{ tone: "warning" | "success"; message: string } | null>(null);
  const [generatedPlan, setGeneratedPlan] = useState<LessonPlanAI | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const lastAutoSubjectRef = useRef<string | null>(null);

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
    setGenerationError(null);
    setToast(null);
    lastAutoSubjectRef.current = plan ? null : defaultValues.subject.trim() || null;
  }, [defaultValues, isOpen, plan, promptForm]);

  const selectedGroup = groups.find((group) => group.id === promptForm.watch("groupId"));
  const subjectOptions = getSubjectOptionsForLevel(selectedGroup?.level);

  useEffect(() => {
    if (!selectedGroup) {
      return;
    }

    promptForm.setValue("groupName", selectedGroup.name, { shouldValidate: false });
    promptForm.setValue("educationLevel", selectedGroup.level ?? "", { shouldValidate: false });

    if (!plan && selectedGroup.subject) {
      const currentSubject = promptForm.getValues("subject").trim();
      const nextSubject = selectedGroup.subject.trim();

      if (!currentSubject || currentSubject === lastAutoSubjectRef.current) {
        promptForm.setValue("subject", nextSubject, { shouldDirty: true, shouldValidate: true });
        lastAutoSubjectRef.current = nextSubject;
      }
    }
  }, [plan, promptForm, selectedGroup]);

  const runGeneration = promptForm.handleSubmit((values) => {
    setSaveError(null);
    setGenerationError(null);
    setToast(null);

    startGenerateTransition(async () => {
      const action = plan ? improvePlanWithAIAction : generatePlanWithAIAction;
      const result = await action(values);

      if (!result.success) {
        setGeneratedPlan(null);
        setGenerationError(result.message);
        setToast({
          tone: "warning",
          message: result.message || "No fue posible generar la propuesta en este momento. Intenta nuevamente en unos instantes."
        });
        return;
      }

      setGenerationError(null);
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

    if (!hasRequiredGeneratedContent(parsedPlan.data)) {
      setSaveError("Completa los bloques esenciales de la propuesta antes de aplicarla al plan.");
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
        contentClassName="max-w-none p-0 md:w-[min(1200px,calc(100vw-48px))]"
        bodyClassName="min-h-0 flex flex-1 flex-col overflow-hidden p-0"
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-10 pt-4 scroll-smooth [scrollbar-color:rgba(148,163,184,0.42)_transparent] [scrollbar-width:thin] sm:px-6 sm:py-5 lg:p-0 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300/70 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700/70">
            <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(360px,0.88fr)_minmax(0,1.12fr)] lg:gap-0">
              <form id="plan-ai-form" className="min-w-0 space-y-5 lg:border-r lg:border-slate-200 lg:px-6 lg:py-5 dark:lg:border-white/10" onSubmit={runGeneration}>
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
                      <label className={fieldLabelClassName}>Área o asignatura</label>
                      <Combobox
                        value={promptForm.watch("subject")}
                        options={subjectOptions}
                        onChange={(value) => promptForm.setValue("subject", value, { shouldDirty: true, shouldValidate: true })}
                        placeholder={isPreschoolLevel(selectedGroup?.level) ? "Selecciona o escribe una dimensión" : "Selecciona o escribe un área"}
                      />
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
                  {!generatedPlan ? (
                    <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">Cuando el contexto esté listo, genera la propuesta desde el botón inferior.</p>
                  ) : null}
                </div>
              </form>

              <div className="min-w-0 lg:px-6 lg:py-5">
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

                  <div className="grid gap-4 xl:grid-cols-2">
                    <div className={proposalCardClassName}>
                      <label className={fieldLabelClassName}>Título</label>
                      <input
                        value={generatedPlan.title}
                        onChange={(event) => handleGeneratedPlanChange("title", event.target.value)}
                        className={fieldInputClassName}
                      />
                    </div>

                    <div className={proposalCardClassName}>
                      <label className={fieldLabelClassName}>Área o asignatura</label>
                      <Combobox
                        value={generatedPlan.subject}
                        options={subjectOptions}
                        onChange={(value) => handleGeneratedPlanChange("subject", value)}
                        placeholder={isPreschoolLevel(selectedGroup?.level) ? "Selecciona o escribe una dimensión" : "Selecciona o escribe un área"}
                        inputClassName={fieldInputClassName}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_180px]">
                    <div className={proposalCardClassName}>
                      <label className={fieldLabelClassName}>Tema</label>
                      <input
                        value={generatedPlan.topic}
                        onChange={(event) => handleGeneratedPlanChange("topic", event.target.value)}
                        className={fieldInputClassName}
                      />
                    </div>

                    <div className={proposalCardClassName}>
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

                  <div className={proposalCardClassName}>
                    <label className={fieldLabelClassName}>Objetivo</label>
                    <textarea
                      rows={5}
                      value={generatedPlan.objective}
                      onChange={(event) => handleGeneratedPlanChange("objective", event.target.value)}
                      className={proposalTextareaClassName}
                    />
                  </div>

                  <div className={proposalCardClassName}>
                    <label className={fieldLabelClassName}>Recursos</label>
                    <textarea
                      rows={4}
                      value={generatedPlan.resources}
                      onChange={(event) => handleGeneratedPlanChange("resources", event.target.value)}
                      className={proposalTextareaClassName}
                    />
                  </div>

                  <div className="grid gap-4 xl:grid-cols-3">
                    <div className={proposalCardClassName}>
                      <label className={fieldLabelClassName}>Inicio</label>
                      <textarea
                        rows={9}
                        value={generatedPlan.inicio}
                        onChange={(event) => handleGeneratedPlanChange("inicio", event.target.value)}
                        className={proposalTextareaClassName}
                      />
                    </div>

                    <div className={proposalCardClassName}>
                      <label className={fieldLabelClassName}>Desarrollo</label>
                      <textarea
                        rows={9}
                        value={generatedPlan.desarrollo}
                        onChange={(event) => handleGeneratedPlanChange("desarrollo", event.target.value)}
                        className={proposalTextareaClassName}
                      />
                    </div>

                    <div className={proposalCardClassName}>
                      <label className={fieldLabelClassName}>Cierre</label>
                      <textarea
                        rows={9}
                        value={generatedPlan.cierre}
                        onChange={(event) => handleGeneratedPlanChange("cierre", event.target.value)}
                        className={proposalTextareaClassName}
                      />
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                    <p className="text-sm font-semibold text-slate-950 dark:text-white">Distribución del tiempo</p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
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
                    <div className={proposalCardClassName}>
                      <label className={fieldLabelClassName}>Observaciones docentes</label>
                      <textarea
                        rows={6}
                        value={generatedPlan.observaciones_docente ?? ""}
                        onChange={(event) => handleGeneratedPlanChange("observaciones_docente", event.target.value)}
                        className={proposalTextareaClassName}
                      />
                    </div>

                    <div className={proposalCardClassName}>
                      <label className={fieldLabelClassName}>Sugerencias metodológicas</label>
                      <textarea
                        rows={6}
                        value={generatedPlan.sugerencias_metodologicas ?? ""}
                        onChange={(event) => handleGeneratedPlanChange("sugerencias_metodologicas", event.target.value)}
                        className={proposalTextareaClassName}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid h-full min-h-[420px] place-items-center rounded-[30px] border border-dashed border-slate-300 bg-slate-50/80 px-8 text-center dark:border-white/10 dark:bg-white/[0.02]">
                  <div className="max-w-md space-y-4">
                    <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-violet-500/15 text-violet-200">
                      <Sparkles className="h-7 w-7" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-950 dark:text-white">
                      {generationError ? "La propuesta no pudo generarse por ahora" : plan ? "Propuesta de mejora del plan" : "Propuesta de plan asistida por IA"}
                    </h3>
                    <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
                      {generationError
                        ? generationError
                        : "Completa el contexto pedagógico y genera una propuesta estructurada para revisarla antes de guardarla."}
                    </p>
                    {generationError ? (
                      <div className="rounded-2xl border border-amber-300/70 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
                        Puedes intentarlo nuevamente sin cerrar esta ventana. Ajusta el contexto si lo necesitas y vuelve a generar la propuesta.
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
              </div>
            </div>
          </div>

          <div className="shrink-0 border-t border-slate-200 bg-white px-4 py-3 shadow-[0_-18px_40px_-28px_rgba(15,23,42,0.12)] sm:px-6 sm:py-4 dark:border-white/10 dark:bg-slate-950 dark:shadow-[0_-18px_40px_-28px_rgba(0,0,0,0.75)]">
            <div className="grid gap-3 sm:flex sm:flex-wrap sm:items-center sm:justify-end">
              {saveError ? <p className="text-sm text-rose-400 sm:mr-auto">{saveError}</p> : null}
              <button
                type="button"
                onClick={onClose}
                disabled={isGenerating || isSaving}
                className="order-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 sm:order-none dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
              >
                Cancelar
              </button>
              {generatedPlan ? (
                <>
                  <button
                    type="button"
                    onClick={runGeneration}
                    disabled={isGenerating || isSaving}
                    className="order-3 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 sm:order-none dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
                  >
                    {isGenerating ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                    Regenerar propuesta
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isGenerating || isSaving || !hasRequiredGeneratedContent(generatedPlan)}
                    className="order-1 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 sm:order-none sm:w-auto sm:py-2.5"
                  >
                    {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {plan ? "Aplicar cambios al plan" : "Guardar plan"}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={runGeneration}
                  disabled={isGenerating || isSaving}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:py-2.5"
                >
                  {isGenerating ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                  Generar propuesta
                </button>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};
