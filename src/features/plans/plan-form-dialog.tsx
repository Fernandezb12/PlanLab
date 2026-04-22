"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { BookOpenText, ClipboardCheck, LoaderCircle, Save } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { Modal } from "@/components/ui/modal";
import { type PlanActionResult } from "@/features/plans/actions";
import {
  evaluationTypes,
  evaluationTypeLabels,
  getPlanStatusLabel,
  normalizeEvaluationType,
  planSchema,
  planStatuses,
  type PlanInput
} from "@/lib/validations/plans";

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
};

type PlanFormDialogProps = {
  isOpen: boolean;
  groups: GroupOption[];
  plan?: PlanRecord | null;
  onClose: () => void;
  onCompleted: (result: PlanActionResult) => void;
  createPlanAction: (input: PlanInput) => Promise<PlanActionResult>;
  updatePlanAction: (input: PlanInput) => Promise<PlanActionResult>;
};

const buildEmptyValues = (groups: GroupOption[]): PlanInput => ({
  groupId: groups[0]?.id ?? "",
  title: "",
  subject: "",
  topic: "",
  durationMinutes: 45,
  objective: "",
  resources: "",
  evaluationType: "formativa",
  status: "draft"
});

export const PlanFormDialog = ({ isOpen, groups, plan, onClose, onCompleted, createPlanAction, updatePlanAction }: PlanFormDialogProps) => {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const form = useForm<PlanInput>({
    resolver: zodResolver(planSchema),
    defaultValues: buildEmptyValues(groups)
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    form.reset(
      plan
        ? {
            id: plan.id,
            groupId: plan.group_id ?? "",
            title: plan.title,
            subject: plan.subject,
            topic: plan.topic,
            durationMinutes: plan.duration_minutes,
            objective: plan.objective,
            resources: plan.resources ?? "",
            evaluationType: normalizeEvaluationType(plan.evaluation_type) ?? "formativa",
            status: (planStatuses.includes(plan.status as (typeof planStatuses)[number]) ? plan.status : "draft") as PlanInput["status"]
          }
        : buildEmptyValues(groups)
    );
    setServerError(null);
  }, [form, groups, isOpen, plan]);

  const onSubmit = form.handleSubmit((values) => {
    setServerError(null);
    startTransition(async () => {
      const action = plan ? updatePlanAction : createPlanAction;
      const result = await action(values);

      if (!result.success && result.fieldErrors) {
        Object.entries(result.fieldErrors).forEach(([field, messages]) => {
          if (!messages?.length) {
            return;
          }

          form.setError(field as keyof PlanInput, { type: "server", message: messages[0] });
        });
      }

      if (result.success) {
        form.reset(buildEmptyValues(groups));
      } else if (!result.fieldErrors) {
        setServerError(result.message);
      }

      onCompleted(result);
    });
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isPending) {
          onClose();
        }
      }}
      title={plan ? "Editar plan" : "Crear nuevo plan"}
      description="Registra la información base del plan y déjalo listo para las siguientes fases."
      contentClassName="max-w-4xl max-h-[85vh] overflow-hidden p-0"
      bodyClassName="min-h-0 flex-1 p-0"
    >
      <div className="flex h-[85vh] max-h-[85vh] min-h-0 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-5">
          <form id="plan-form" onSubmit={onSubmit} className="space-y-5 pb-2">
            <div className="rounded-[26px] border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04]">
              <div className="mb-4 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-violet-500/15 text-violet-200">
                  <BookOpenText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-950 dark:text-white">Información general</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Define el grupo, el estado y la identidad principal del plan.</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-800 dark:text-slate-200">Grupo</label>
                  <select
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 dark:border-white/10 dark:bg-slate-900 dark:text-white"
                    {...form.register("groupId")}
                  >
                    <option value="">Selecciona un grupo</option>
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name} {group.level ? `· ${group.level}` : ""}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-rose-400">{form.formState.errors.groupId?.message}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-800 dark:text-slate-200">Estado</label>
                  <select
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 dark:border-white/10 dark:bg-slate-900 dark:text-white"
                    {...form.register("status")}
                  >
                    {planStatuses.map((status) => (
                      <option key={status} value={status}>
                        {getPlanStatusLabel(status)}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-rose-400">{form.formState.errors.status?.message}</p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <label className="text-sm font-medium text-slate-800 dark:text-slate-200">Título</label>
                <input
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  placeholder="Ecosistemas y relaciones tróficas"
                  {...form.register("title")}
                />
                <p className="text-xs text-rose-400">{form.formState.errors.title?.message}</p>
              </div>
            </div>

            <div className="rounded-[26px] border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04]">
              <div className="mb-4 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-500/15 text-blue-200">
                  <ClipboardCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-950 dark:text-white">Diseño pedagógico</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Completa los datos académicos y pedagógicos del plan.</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-800 dark:text-slate-200">Área</label>
                  <input
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    placeholder="Ciencias Naturales"
                    {...form.register("subject")}
                  />
                  <p className="text-xs text-rose-400">{form.formState.errors.subject?.message}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-800 dark:text-slate-200">Tema</label>
                  <input
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    placeholder="Cadenas alimenticias"
                    {...form.register("topic")}
                  />
                  <p className="text-xs text-rose-400">{form.formState.errors.topic?.message}</p>
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-[180px_1fr]">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-800 dark:text-slate-200">Duración</label>
                  <input
                    type="number"
                    min={1}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    {...form.register("durationMinutes", { valueAsNumber: true })}
                  />
                  <p className="text-xs text-rose-400">{form.formState.errors.durationMinutes?.message}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-800 dark:text-slate-200">Tipo de evaluación</label>
                  <select
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 dark:border-white/10 dark:bg-slate-900 dark:text-white"
                    {...form.register("evaluationType")}
                  >
                    {evaluationTypes.map((evaluationType) => (
                      <option key={evaluationType} value={evaluationType}>
                        {evaluationTypeLabels[evaluationType]}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-rose-400">{form.formState.errors.evaluationType?.message}</p>
                </div>
              </div>

              <div className="mt-4 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-800 dark:text-slate-200">Objetivo</label>
                  <textarea
                    rows={5}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    placeholder="Describe qué se espera lograr con la sesión."
                    {...form.register("objective")}
                  />
                  <p className="text-xs text-rose-400">{form.formState.errors.objective?.message}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-800 dark:text-slate-200">Recursos</label>
                  <textarea
                    rows={5}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    placeholder="Libro guía, carteles, video, cuaderno..."
                    {...form.register("resources")}
                  />
                  <p className="text-xs text-rose-400">{form.formState.errors.resources?.message}</p>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="sticky bottom-0 shrink-0 border-t border-slate-200 bg-white/96 px-6 py-4 shadow-[0_-18px_40px_-28px_rgba(15,23,42,0.12)] backdrop-blur-md dark:border-white/10 dark:bg-slate-950/95 dark:shadow-[0_-18px_40px_-28px_rgba(0,0,0,0.75)]">
          <div className="flex flex-wrap items-center justify-end gap-3">
            {serverError ? <p className="mr-auto text-sm text-rose-400">{serverError}</p> : null}
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
            className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
            >
              Cancelar
            </button>
            <button
              form="plan-form"
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {plan ? "Guardar cambios" : "Crear plan"}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
