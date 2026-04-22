"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FilePlus2, LoaderCircle, Save } from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { Modal } from "@/components/ui/modal";
import { type ReportActionResult } from "@/features/reports/actions";
import { createReportSchema, reportTypeLabels, reportTypes, type CreateReportInput } from "@/lib/validations/reports";

type GroupOption = {
  id: string;
  name: string;
  level: string | null;
};

type ActivityOption = {
  id: string;
  title: string;
  group_id: string | null;
  activity_date: string | null;
};

type ReportFormDialogProps = {
  isOpen: boolean;
  groups: GroupOption[];
  activities: ActivityOption[];
  onClose: () => void;
  onCompleted: (result: ReportActionResult) => void;
  createReportAction: (input: CreateReportInput) => Promise<ReportActionResult>;
};

const emptyValues: CreateReportInput = {
  groupId: "",
  activityId: "",
  reportType: "rendimiento"
};

export const ReportFormDialog = ({ isOpen, groups, activities, onClose, onCompleted, createReportAction }: ReportFormDialogProps) => {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const form = useForm<CreateReportInput>({
    resolver: zodResolver(createReportSchema),
    defaultValues: emptyValues
  });

  const selectedGroupId = form.watch("groupId");
  const filteredActivities = useMemo(
    () => activities.filter((activity) => !selectedGroupId || activity.group_id === selectedGroupId),
    [activities, selectedGroupId]
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    form.reset(emptyValues);
    setServerError(null);
  }, [form, isOpen]);

  useEffect(() => {
    const currentActivityId = form.getValues("activityId");

    if (!currentActivityId) {
      return;
    }

    const activityStillVisible = filteredActivities.some((activity) => activity.id === currentActivityId);

    if (!activityStillVisible) {
      form.setValue("activityId", "");
    }
  }, [filteredActivities, form]);

  const onSubmit = form.handleSubmit((values) => {
    setServerError(null);

    startTransition(async () => {
      const result = await createReportAction(values);

      if (!result.success && result.fieldErrors) {
        Object.entries(result.fieldErrors).forEach(([field, messages]) => {
          if (!messages?.length) {
            return;
          }

          form.setError(field as keyof CreateReportInput, { type: "server", message: messages[0] });
        });
      }

      if (result.success) {
        form.reset(emptyValues);
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
      title="Crear reporte"
      description="Registra la base del reporte y deja preparado el proceso de consolidación."
      contentClassName="max-w-3xl"
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="rounded-[26px] border border-white/10 bg-white/[0.04] p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-500/15 text-slate-100">
              <FilePlus2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Configuración del reporte</h3>
              <p className="text-sm text-slate-400">Selecciona el grupo, el tipo de reporte y, si corresponde, una actividad asociada.</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Grupo</label>
              <select
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-400/20"
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
              <label className="text-sm font-medium text-slate-200">Tipo de reporte</label>
              <select
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-400/20"
                {...form.register("reportType")}
              >
                {reportTypes.map((reportType) => (
                  <option key={reportType} value={reportType}>
                    {reportTypeLabels[reportType]}
                  </option>
                ))}
              </select>
              <p className="text-xs text-rose-400">{form.formState.errors.reportType?.message}</p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <label className="text-sm font-medium text-slate-200">Actividad asociada</label>
            <select
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-400/20"
              {...form.register("activityId")}
            >
              <option value="">Sin actividad específica</option>
              {filteredActivities.map((activity) => (
                <option key={activity.id} value={activity.id}>
                  {activity.title} {activity.activity_date ? `· ${new Date(activity.activity_date).toLocaleDateString("es-CO")}` : ""}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-400">Este vínculo es opcional. Puede asociarse a una actividad específica o dejarse como reporte general del grupo.</p>
            <p className="text-xs text-rose-400">{form.formState.errors.activityId?.message}</p>
          </div>
        </div>

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
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-slate-500 to-slate-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Crear reporte
          </button>
        </div>
      </form>
    </Modal>
  );
};
