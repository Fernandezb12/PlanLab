"use client";

import { LoaderCircle, Save, UsersRound } from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";

import { Modal } from "@/components/ui/modal";
import { type ActivityActionResult, saveActivityRecordsAction } from "@/features/activities/actions";
import { getActivityStatusLabel, type SaveActivityRecordsInput } from "@/lib/validations/activities";

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

type ActivityRecord = {
  id: string;
  group_id: string | null;
  title: string;
  activity_date: string | null;
  status: string;
  groups: { name: string; level: string | null } | { name: string; level: string | null }[] | null;
};

type EditableRecord = SaveActivityRecordsInput["records"][number];

type ActivityRecordsDialogProps = {
  isOpen: boolean;
  activity: ActivityRecord | null;
  students: StudentRecord[];
  existingRecords: ExistingActivityRecord[];
  onClose: () => void;
  onCompleted: (result: ActivityActionResult) => void;
};

const buildInitialRows = (activity: ActivityRecord | null, students: StudentRecord[], existingRecords: ExistingActivityRecord[]): EditableRecord[] => {
  if (!activity?.group_id) {
    return [];
  }

  const existingMap = new Map(existingRecords.filter((record) => record.activity_id === activity.id).map((record) => [record.student_id, record]));

  return students
    .filter((student) => student.group_id === activity.group_id)
    .map((student) => {
      const existingRecord = existingMap.get(student.id);

      return {
        studentId: student.id,
        attended: existingRecord?.attended ?? true,
        resultScore: existingRecord?.result_score ?? null,
        observation: existingRecord?.observation ?? ""
      };
    });
};

export const ActivityRecordsDialog = ({ isOpen, activity, students, existingRecords, onClose, onCompleted }: ActivityRecordsDialogProps) => {
  const [rows, setRows] = useState<EditableRecord[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setRows(buildInitialRows(activity, students, existingRecords));
    setServerError(null);
  }, [activity, existingRecords, isOpen, students]);

  const studentRows = useMemo(() => {
    if (!activity?.group_id) {
      return [];
    }

    const studentMap = new Map(students.filter((student) => student.group_id === activity.group_id).map((student) => [student.id, student]));

    return rows
      .map((row) => {
        const student = studentMap.get(row.studentId);

        if (!student) {
          return null;
        }

        return { row, student };
      })
      .filter((entry): entry is { row: EditableRecord; student: StudentRecord } => Boolean(entry));
  }, [activity?.group_id, rows, students]);

  const relatedGroup = activity ? (Array.isArray(activity.groups) ? activity.groups[0] : activity.groups) : null;

  const updateRow = (studentId: string, updater: (row: EditableRecord) => EditableRecord) => {
    setRows((currentRows) => currentRows.map((row) => (row.studentId === studentId ? updater(row) : row)));
  };

  const handleSubmit = () => {
    if (!activity) {
      return;
    }

    setServerError(null);

    startTransition(async () => {
      const result = await saveActivityRecordsAction({
        activityId: activity.id,
        records: rows
      });

      if (!result.success) {
        setServerError(result.message);
      }

      onCompleted(result);
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isPending) {
          onClose();
        }
      }}
      title={activity ? `Registro de ${activity.title}` : "Registro de resultados"}
      description="Registra asistencia, nota y observaciones de los estudiantes del grupo en una sola acción."
      contentClassName="max-w-none p-0 md:w-[min(1200px,calc(100vw-48px))]"
      bodyClassName="min-h-0 flex flex-1 flex-col overflow-hidden p-0"
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="border-b border-slate-200 px-6 py-5 dark:border-white/10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {relatedGroup?.name ?? "Sin grupo"} {relatedGroup?.level ? `· ${relatedGroup.level}` : ""}
              </p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-500">
                {activity?.activity_date ? new Date(activity.activity_date).toLocaleDateString("es-CO") : "Sin fecha"} · Estado actual:{" "}
                {activity?.status ? getActivityStatusLabel(activity.status) : "Sin estado"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-3 text-sm text-slate-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
              <p className="inline-flex items-center gap-2 font-medium text-slate-950 dark:text-white">
                <UsersRound className="h-4 w-4 text-blue-300" />
                {studentRows.length} estudiantes listos para registrar
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Es posible registrar asistencia, notas y observaciones de forma completa o parcial.</p>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto overscroll-contain px-4 pb-10 pt-5 scroll-smooth [scrollbar-color:rgba(148,163,184,0.42)_transparent] [scrollbar-width:thin] sm:px-6 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300/70 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700/70">
          {!activity?.group_id ? (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              Esta actividad no tiene un grupo asociado. No es posible abrir este registro por ahora.
            </div>
          ) : studentRows.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/90 px-6 py-8 text-center dark:border-white/10 dark:bg-white/[0.04]">
              <p className="text-lg font-semibold text-slate-950 dark:text-white">Aún no hay estudiantes en este grupo</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Agrega estudiantes al grupo para comenzar el registro de asistencia y resultados.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-[26px] border border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.03]">
              <div className="grid grid-cols-[minmax(220px,1.5fr)_140px_140px_minmax(220px,1.8fr)] gap-3 border-b border-slate-200 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:border-white/10 dark:text-slate-400">
                <p>Estudiante</p>
                <p>Asistencia</p>
                <p>Nota</p>
                <p>Observación</p>
              </div>

              <div className="divide-y divide-slate-200 dark:divide-white/10">
                {studentRows.map(({ row, student }) => (
                  <div key={student.id} className="grid grid-cols-[minmax(220px,1.5fr)_140px_140px_minmax(220px,1.8fr)] gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">{student.full_name}</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {student.student_code ?? "Sin código"} · {student.status}
                      </p>
                    </div>

                    <label className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200">
                      <input
                        type="checkbox"
                        checked={row.attended}
                        onChange={(event) =>
                          updateRow(student.id, (currentRow) => ({
                            ...currentRow,
                            attended: event.target.checked
                          }))
                        }
                        className="h-4 w-4 rounded border-white/20 bg-transparent text-blue-500 focus:ring-blue-500/30"
                      />
                      {row.attended ? "Asistió" : "Ausente"}
                    </label>

                    <input
                      type="number"
                      step="0.1"
                      inputMode="decimal"
                      value={row.resultScore ?? ""}
                      onChange={(event) =>
                        updateRow(student.id, (currentRow) => ({
                          ...currentRow,
                          resultScore: event.target.value === "" ? null : Number(event.target.value)
                        }))
                      }
                      className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-slate-900 dark:text-white"
                      placeholder="Opcional"
                    />

                    <textarea
                      rows={2}
                      value={row.observation ?? ""}
                      onChange={(event) =>
                        updateRow(student.id, (currentRow) => ({
                          ...currentRow,
                          observation: event.target.value
                        }))
                      }
                      className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-slate-900 dark:text-white"
                      placeholder="Observación opcional"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-slate-200 bg-white px-4 py-4 sm:px-6 dark:border-white/10 dark:bg-slate-950">
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
              type="button"
              onClick={handleSubmit}
              disabled={isPending || studentRows.length === 0 || !activity?.group_id}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Guardar registro
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
