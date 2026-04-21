"use client";

import { Eye, Pencil, PlusCircle, Trash2 } from "lucide-react";
import { useMemo, useState, useTransition } from "react";

import { EmptyState } from "@/components/ui/empty-state";
import { Card } from "@/components/ui/card";
import { ModuleHeader } from "@/components/ui/module-header";
import { createActivityAction, deleteActivityAction, type ActivityActionResult, updateActivityAction } from "@/features/activities/actions";
import { ActivityDetailsDialog } from "@/features/activities/activity-details-dialog";
import { ActivityFormDialog } from "@/features/activities/activity-form-dialog";
import { getActivityStatusLabel } from "@/lib/validations/activities";

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
  created_at: string;
  lesson_plans: { title: string } | { title: string }[] | null;
  groups: { name: string; level: string | null } | { name: string; level: string | null }[] | null;
};

type FeedbackState = {
  tone: "success" | "error";
  message: string;
} | null;

const statusStyles: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  in_progress: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  pending_record: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
};

type ActivitiesPanelProps = {
  groups: GroupOption[];
  lessonPlans: LessonPlanOption[];
  activities: ActivityRecord[];
};

export const ActivitiesPanel = ({ groups, lessonPlans, activities }: ActivitiesPanelProps) => {
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [formOpen, setFormOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ActivityRecord | null>(null);

  const groupOptions = useMemo(() => groups.map((group) => ({ id: group.id, name: group.name, level: group.level })), [groups]);
  const planOptions = useMemo(
    () =>
      lessonPlans.map((lessonPlan) => ({
        id: lessonPlan.id,
        title: lessonPlan.title,
        group_id: lessonPlan.group_id,
        subject: lessonPlan.subject,
        topic: lessonPlan.topic,
        groups: lessonPlan.groups
      })),
    [lessonPlans]
  );

  const handleCompleted = (result: ActivityActionResult) => {
    setFeedback({
      tone: result.success ? "success" : "error",
      message: result.message
    });

    if (result.success) {
      setFormOpen(false);
      setSelectedActivity(null);
    }
  };

  const openCreateActivity = () => {
    setSelectedActivity(null);
    setFormOpen(true);
  };

  const openEditActivity = (activity: ActivityRecord) => {
    setSelectedActivity(activity);
    setFormOpen(true);
  };

  const openViewActivity = (activity: ActivityRecord) => {
    setSelectedActivity(activity);
    setDetailsOpen(true);
  };

  const handleDeleteActivity = (activity: ActivityRecord) => {
    if (!window.confirm(`Se eliminará la actividad "${activity.title}". ¿Quieres continuar?`)) {
      return;
    }

    startDeleteTransition(async () => {
      const result = await deleteActivityAction(activity.id);
      handleCompleted(result);
    });
  };

  return (
    <section className="space-y-6">
      <ModuleHeader
        title="Actividades"
        subtitle="Programa y administra actividades reales conectadas a tus planes."
        actions={
          <button
            type="button"
            onClick={openCreateActivity}
            disabled={lessonPlans.length === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <PlusCircle className="h-4 w-4" />
            Crear actividad
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

      {lessonPlans.length === 0 ? (
        <EmptyState
          icon={PlusCircle}
          title="Primero crea un plan para programar actividades"
          description="Las actividades nacen a partir de tus planes reales. Cuando tengas planes, podrás programarlas desde aquí."
        />
      ) : !activities.length ? (
        <EmptyState
          icon={PlusCircle}
          title="Todavía no tienes actividades programadas"
          description="Crea tu primera actividad a partir de un plan existente para comenzar el seguimiento real."
          action={
            <button
              type="button"
              onClick={openCreateActivity}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-white/15 dark:text-slate-200 dark:hover:bg-white/10"
            >
              Crear primera actividad
            </button>
          }
        />
      ) : (
        <div className="grid gap-3">
          {activities.map((activity) => {
            const relatedPlan = Array.isArray(activity.lesson_plans) ? activity.lesson_plans[0] : activity.lesson_plans;
            const relatedGroup = Array.isArray(activity.groups) ? activity.groups[0] : activity.groups;

            return (
              <Card key={activity.id} className="glass-card-plus p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <h2 className="text-lg font-bold tracking-tight">{activity.title}</h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {relatedGroup?.name ?? "Sin grupo"} · {relatedPlan?.title ?? "Sin plan"} ·{" "}
                        {activity.activity_date ? new Date(activity.activity_date).toLocaleDateString("es-CO") : "Sin fecha"}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[activity.status] ?? statusStyles.scheduled}`}>
                        {getActivityStatusLabel(activity.status)}
                      </span>
                      {relatedGroup?.level ? (
                        <span className="inline-flex rounded-full border border-white/10 px-2.5 py-1 text-xs font-semibold text-slate-300">
                          {relatedGroup.level}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => openViewActivity(activity)}
                      className="rounded-lg border border-slate-300 p-2 hover:bg-slate-100 dark:border-white/10 dark:hover:bg-white/10"
                      aria-label="Ver actividad"
                      title="Ver actividad"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditActivity(activity)}
                      className="rounded-lg border border-slate-300 p-2 hover:bg-slate-100 dark:border-white/10 dark:hover:bg-white/10"
                      aria-label="Editar actividad"
                      title="Editar actividad"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteActivity(activity)}
                      disabled={isDeleting}
                      className="rounded-lg border border-rose-500/30 p-2 text-rose-300 hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                      aria-label="Eliminar actividad"
                      title="Eliminar actividad"
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

      <ActivityFormDialog
        isOpen={formOpen}
        groups={groupOptions}
        lessonPlans={planOptions}
        activity={selectedActivity}
        onClose={() => {
          setFormOpen(false);
          setSelectedActivity(null);
        }}
        onCompleted={handleCompleted}
        createActivityAction={createActivityAction}
        updateActivityAction={updateActivityAction}
      />

      <ActivityDetailsDialog
        isOpen={detailsOpen}
        activity={selectedActivity}
        onClose={() => {
          setDetailsOpen(false);
          setSelectedActivity(null);
        }}
      />
    </section>
  );
};
