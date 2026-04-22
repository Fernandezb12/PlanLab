"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Save } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { Modal } from "@/components/ui/modal";
import { type ActionResult } from "@/features/groups/actions";
import { studentSchema, studentStatuses, type StudentInput } from "@/lib/validations/groups";

type GroupOption = {
  id: string;
  name: string;
};

type StudentRecord = {
  id: string;
  full_name: string;
  student_code: string | null;
  status: string;
  notes: string | null;
  group_id: string | null;
};

type StudentFormDialogProps = {
  isOpen: boolean;
  student?: StudentRecord | null;
  groups: GroupOption[];
  onClose: () => void;
  onCompleted: (result: ActionResult) => void;
  createStudentAction: (input: StudentInput) => Promise<ActionResult>;
  updateStudentAction: (input: StudentInput) => Promise<ActionResult>;
};

const emptyValues: StudentInput = {
  fullName: "",
  studentCode: "",
  groupId: "",
  status: "activo",
  notes: ""
};

export const StudentFormDialog = ({ isOpen, student, groups, onClose, onCompleted, createStudentAction, updateStudentAction }: StudentFormDialogProps) => {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const form = useForm<StudentInput>({
    resolver: zodResolver(studentSchema),
    defaultValues: emptyValues
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    form.reset(
      student
        ? {
            id: student.id,
            fullName: student.full_name,
            studentCode: student.student_code ?? "",
            groupId: student.group_id ?? "",
            status: student.status as StudentInput["status"],
            notes: student.notes ?? ""
          }
        : {
            ...emptyValues,
            groupId: groups[0]?.id ?? ""
          }
    );
    setServerError(null);
  }, [form, groups, isOpen, student]);

  const onSubmit = form.handleSubmit((values) => {
    setServerError(null);
    startTransition(async () => {
      const action = student ? updateStudentAction : createStudentAction;
      const result = await action(values);

      if (!result.success && result.fieldErrors) {
        Object.entries(result.fieldErrors).forEach(([field, messages]) => {
          if (!messages?.length) {
            return;
          }

          form.setError(field as keyof StudentInput, { type: "server", message: messages[0] });
        });
      }

      if (result.success) {
        form.reset({ ...emptyValues, groupId: groups[0]?.id ?? "" });
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
      title={student ? "Editar estudiante" : "Agregar estudiante"}
      description="Asocia cada estudiante a uno de tus grupos y registra su estado actual."
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-800 dark:text-slate-200">Nombre completo</label>
          <input
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
            placeholder="María José Gómez"
            {...form.register("fullName")}
          />
          <p className="text-xs text-rose-400">{form.formState.errors.fullName?.message}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-800 dark:text-slate-200">Código</label>
            <input
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
              placeholder="2026-014"
              {...form.register("studentCode")}
            />
            <p className="text-xs text-rose-400">{form.formState.errors.studentCode?.message}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-800 dark:text-slate-200">Grupo</label>
            <select
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-slate-900 dark:text-white"
              {...form.register("groupId")}
            >
              <option value="">Selecciona un grupo</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-rose-400">{form.formState.errors.groupId?.message}</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[220px_1fr]">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-800 dark:text-slate-200">Estado</label>
            <select
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-slate-900 dark:text-white"
              {...form.register("status")}
            >
              {studentStatuses.map((status) => (
                <option key={status} value={status}>
                  {status[0].toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
            <p className="text-xs text-rose-400">{form.formState.errors.status?.message}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-800 dark:text-slate-200">Observación</label>
            <textarea
              rows={3}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
              placeholder="Notas de seguimiento, apoyos o alertas suaves."
              {...form.register("notes")}
            />
            <p className="text-xs text-rose-400">{form.formState.errors.notes?.message}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
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
            type="submit"
            disabled={isPending || groups.length === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {student ? "Guardar cambios" : "Agregar estudiante"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
