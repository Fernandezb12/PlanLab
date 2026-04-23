"use client";

import { ClipboardCheck, Eye, Pencil, PlusCircle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { EmptyState } from "@/components/ui/empty-state";
import { Card } from "@/components/ui/card";
import { ModuleHeader } from "@/components/ui/module-header";
import { createActivityAction, deleteActivityAction, type ActivityActionResult, updateActivityAction } from "@/features/activities/actions";
import { ActivityDetailsDialog } from "@/features/activities/activity-details-dialog";
import { ActivityFormDialog } from "@/features/activities/activity-form-dialog";
import { ActivityRecordsDialog } from "@/features/activities/activity-records-dialog";
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

type StudentRecord = {
  id: string;
  group_id: string | null;
  full_name: string;
  student_code: string | null;
  status: string;
};

type ExistingActivityRecord = {
  id: string;
  activity_id: string;
  student_id: string;
  attended: boolean;
  result_score: number | null;
  observation: string | null;
};

type FeedbackState = {
  tone: "success" | "error";
  message: string;
} | null;

const statusStyles: Record<string, string> = {
  scheduled: "border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/20 dark:bg-blue-900/30 dark:text-blue-300",
  in_progress: "border border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/20 dark:bg-violet-900/30 dark:text-violet-300",
  pending_record: "border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-900/30 dark:text-amber-300",
  completed: "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-900/30 dark:text-emerald-300"
};

type ActivitiesPanelProps = {
  groups: GroupOption[];
  lessonPlans: LessonPlanOption[];
  activities: ActivityRecord[];
  students: StudentRecord[];
  activityRecords: ExistingActivityRecord[];
};

export const ActivitiesPanel = ({ groups, lessonPlans, activities, students, activityRecords }: ActivitiesPanelProps) => {
  const router = useRouter();
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [formOpen, setFormOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [recordsOpen, setRecordsOpen] = useState(false);
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
      setRecordsOpen(false);
      setSelectedActivity(null);
      router.refresh();
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

  const openManageRecords = (activity: ActivityRecord) => {
    setSelectedActivity(activity);
    setRecordsOpen(true);
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
        subtitle="Programa y organiza actividades vinculadas a tus planes."
        actions={
          <button
            type="button"
            onClick={openCreateActivity}
            disabled={lessonPlans.length === 0}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/30 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-5 sm:py-3 sm:text-[0.95rem]"
          >
            <PlusCircle className="h-4 w-4" />
            Crear actividad
          </button>
        }
      />

      {feedback ? (
        <div className={`rounded-2xl border px-4 py-3 text-sm ${feedback.tone === "success" ? "semantic-success" : "semantic-risk"}`}>
          {feedback.message}
        </div>
      ) : null}

      {lessonPlans.length === 0 ? (
        <EmptyState
          icon={PlusCircle}
          title="Primero crea un plan para programar actividades"
          description="Las actividades se crean a partir de tus planes. Cuando tengas uno disponible, podrás programarlas desde aquí."
        />
      ) : !activities.length ? (
        <EmptyState
          icon={PlusCircle}
          title="Todavía no tienes actividades programadas"
          description="Crea tu primera actividad a partir de un plan existente para comenzar el seguimiento del curso."
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
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 space-y-2">
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
                        <span className="inline-flex rounded-full border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:border-white/10 dark:text-slate-300">
                          {relatedGroup.level}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="grid w-full grid-cols-4 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:justify-end">
                    <button
                      type="button"
                      onClick={() => openManageRecords(activity)}
                      className="inline-flex h-10 items-center justify-center rounded-lg border border-emerald-300 bg-emerald-50 px-2 text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-transparent dark:text-emerald-200 dark:hover:bg-emerald-500/10 sm:h-11 sm:min-w-11 sm:px-3"
                      aria-label="Registrar resultados"
                      title="Registrar resultados"
                    >
                      <ClipboardCheck className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => openViewActivity(activity)}
                      className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-2 text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:bg-transparent dark:text-slate-200 dark:hover:bg-white/10 sm:h-11 sm:min-w-11 sm:px-3"
                      aria-label="Ver actividad"
                      title="Ver actividad"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditActivity(activity)}
                      className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-2 text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:bg-transparent dark:text-slate-200 dark:hover:bg-white/10 sm:h-11 sm:min-w-11 sm:px-3"
                      aria-label="Editar actividad"
                      title="Editar actividad"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteActivity(activity)}
                      disabled={isDeleting}
                      className="inline-flex h-10 items-center justify-center rounded-lg border border-rose-300 bg-rose-50 px-2 text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-500/30 dark:bg-transparent dark:text-rose-300 dark:hover:bg-rose-500/10 sm:h-11 sm:min-w-11 sm:px-3"
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

      <ActivityRecordsDialog
        isOpen={recordsOpen}
        activity={selectedActivity}
        students={students}
        existingRecords={activityRecords}
        onClose={() => {
          setRecordsOpen(false);
          setSelectedActivity(null);
        }}
        onCompleted={handleCompleted}
      />
    </section>
  );
};
