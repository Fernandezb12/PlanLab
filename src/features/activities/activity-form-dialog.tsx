"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarCheck2, ClipboardList, LoaderCircle, Save } from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { Modal } from "@/components/ui/modal";
import { type ActivityActionResult } from "@/features/activities/actions";
import { activitySchema, activityStatuses, activityStatusLabels, type ActivityInput } from "@/lib/validations/activities";

type GroupOption = {
  id: string;
  name: string;
  level: string | null;
};

type LessonPlanOption = {
  id: string;
  title: string;
  group_id: string | null;
  subject: string;
  topic: string;
  groups: { name: string; level: string | null } | { name: string; level: string | null }[] | null;
};

type ActivityRecord = {
  id: string;
  lesson_plan_id: string | null;
  group_id: string | null;
  title: string;
  activity_date: string | null;
  status: string;
  notes: string | null;
};

type ActivityFormDialogProps = {
  isOpen: boolean;
  groups: GroupOption[];
  lessonPlans: LessonPlanOption[];
  activity?: ActivityRecord | null;
  onClose: () => void;
  onCompleted: (result: ActivityActionResult) => void;
  createActivityAction: (input: ActivityInput) => Promise<ActivityActionResult>;
  updateActivityAction: (input: ActivityInput) => Promise<ActivityActionResult>;
};

const todayString = () => new Date().toISOString().slice(0, 10);

const buildEmptyValues = (lessonPlans: LessonPlanOption[]): ActivityInput => ({
  lessonPlanId: lessonPlans[0]?.id ?? "",
  groupId: lessonPlans[0]?.group_id ?? "",
  title: "",
  activityDate: todayString(),
  status: "scheduled",
  notes: ""
});

export const ActivityFormDialog = ({
  isOpen,
  groups,
  lessonPlans,
  activity,
  onClose,
  onCompleted,
  createActivityAction,
  updateActivityAction
}: ActivityFormDialogProps) => {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const form = useForm<ActivityInput>({
    resolver: zodResolver(activitySchema),
    defaultValues: buildEmptyValues(lessonPlans)
  });

  const watchedLessonPlanId = form.watch("lessonPlanId");
  const selectedLessonPlan = useMemo(() => lessonPlans.find((plan) => plan.id === watchedLessonPlanId) ?? null, [lessonPlans, watchedLessonPlanId]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    form.reset(
      activity
        ? {
            id: activity.id,
            lessonPlanId: activity.lesson_plan_id ?? "",
            groupId: activity.group_id ?? "",
            title: activity.title,
            activityDate: activity.activity_date ?? todayString(),
            status: (activityStatuses.includes(activity.status as (typeof activityStatuses)[number]) ? activity.status : "scheduled") as ActivityInput["status"],
            notes: activity.notes ?? ""
          }
        : buildEmptyValues(lessonPlans)
    );
    setServerError(null);
  }, [activity, form, isOpen, lessonPlans]);

  useEffect(() => {
    if (!selectedLessonPlan) {
      return;
    }

    // Yo sincronizo el grupo con el plan para mantener la relación consistente.
    if (selectedLessonPlan.group_id) {
      form.setValue("groupId", selectedLessonPlan.group_id, { shouldValidate: true });
    }

    if (!activity && !form.getValues("title")) {
      form.setValue("title", selectedLessonPlan.title, { shouldValidate: true });
    }
  }, [activity, form, selectedLessonPlan]);

  const onSubmit = form.handleSubmit((values) => {
    setServerError(null);
    startTransition(async () => {
      const action = activity ? updateActivityAction : createActivityAction;
      const result = await action(values);

      if (!result.success && result.fieldErrors) {
        Object.entries(result.fieldErrors).forEach(([field, messages]) => {
          if (!messages?.length) {
            return;
          }

          form.setError(field as keyof ActivityInput, { type: "server", message: messages[0] });
        });
      }

      if (result.success) {
        form.reset(buildEmptyValues(lessonPlans));
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
      title={activity ? "Editar actividad" : "Crear actividad"}
      description="Programa una actividad real a partir de uno de tus planes existentes."
      contentClassName="max-w-4xl max-h-[85vh] overflow-hidden p-0"
    >
      <div className="flex h-[85vh] max-h-[85vh] min-h-0 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-5">
          <form id="activity-form" onSubmit={onSubmit} className="space-y-5 pb-2">
            <div className="rounded-[26px] border border-white/10 bg-white/[0.04] p-5">
              <div className="mb-4 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-500/15 text-blue-200">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Vinculación con el plan</h3>
                  <p className="text-sm text-slate-400">Selecciona el plan real que dará origen a la actividad.</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">Plan asociado</label>
                  <select
                    className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                    {...form.register("lessonPlanId")}
                  >
                    <option value="">Selecciona un plan</option>
                    {lessonPlans.map((lessonPlan) => {
                      const relatedGroup = Array.isArray(lessonPlan.groups) ? lessonPlan.groups[0] : lessonPlan.groups;

                      return (
                        <option key={lessonPlan.id} value={lessonPlan.id}>
                          {lessonPlan.title} {relatedGroup?.name ? `· ${relatedGroup.name}` : ""}
                        </option>
                      );
                    })}
                  </select>
                  <p className="text-xs text-rose-400">{form.formState.errors.lessonPlanId?.message}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">Grupo</label>
                  <select
                    className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
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
              </div>

              {selectedLessonPlan ? (
                <div className="mt-4 rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-sm text-slate-300">
                  <p className="font-medium text-white">{selectedLessonPlan.subject}</p>
                  <p className="mt-1 text-slate-400">{selectedLessonPlan.topic}</p>
                </div>
              ) : null}
            </div>

            <div className="rounded-[26px] border border-white/10 bg-white/[0.04] p-5">
              <div className="mb-4 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-violet-500/15 text-violet-200">
                  <CalendarCheck2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Programación</h3>
                  <p className="text-sm text-slate-400">Define cuándo ocurrirá la actividad y en qué estado se encuentra.</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-[1.2fr_220px_1fr]">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">Título</label>
                  <input
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Laboratorio de ecosistemas"
                    {...form.register("title")}
                  />
                  <p className="text-xs text-rose-400">{form.formState.errors.title?.message}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">Fecha</label>
                  <input
                    type="date"
                    className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                    {...form.register("activityDate")}
                  />
                  <p className="text-xs text-rose-400">{form.formState.errors.activityDate?.message}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">Estado</label>
                  <select
                    className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                    {...form.register("status")}
                  >
                    {activityStatuses.map((status) => (
                      <option key={status} value={status}>
                        {activityStatusLabels[status]}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-rose-400">{form.formState.errors.status?.message}</p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <label className="text-sm font-medium text-slate-200">Notas</label>
                <textarea
                  rows={4}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Indicaciones, materiales o recordatorios para la actividad."
                  {...form.register("notes")}
                />
                <p className="text-xs text-rose-400">{form.formState.errors.notes?.message}</p>
              </div>
            </div>
          </form>
        </div>

        <div className="sticky bottom-0 shrink-0 border-t border-white/10 bg-slate-950/95 px-6 py-4 shadow-[0_-18px_40px_-28px_rgba(0,0,0,0.75)] backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-end gap-3">
            {serverError ? <p className="mr-auto text-sm text-rose-400">{serverError}</p> : null}
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              form="activity-form"
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {activity ? "Guardar cambios" : "Crear actividad"}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
