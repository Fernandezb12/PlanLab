"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Save } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { Modal } from "@/components/ui/modal";
import { type ActionResult } from "@/features/groups/actions";
import { groupSchema, type GroupInput } from "@/lib/validations/groups";

type GroupRecord = {
  id: string;
  name: string;
  level: string | null;
  subject: string | null;
  period?: string | null;
};

type GroupFormDialogProps = {
  isOpen: boolean;
  group?: GroupRecord | null;
  onClose: () => void;
  onCompleted: (result: ActionResult) => void;
  createGroupAction: (input: GroupInput) => Promise<ActionResult>;
  updateGroupAction: (input: GroupInput) => Promise<ActionResult>;
};

const emptyValues: GroupInput = {
  name: "",
  level: "",
  subject: "",
  period: ""
};

export const GroupFormDialog = ({ isOpen, group, onClose, onCompleted, createGroupAction, updateGroupAction }: GroupFormDialogProps) => {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const form = useForm<GroupInput>({
    resolver: zodResolver(groupSchema),
    defaultValues: emptyValues
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    form.reset(
      group
        ? {
            id: group.id,
            name: group.name,
            level: group.level ?? "",
            subject: group.subject ?? "",
            period: group.period ?? ""
          }
        : emptyValues
    );
    setServerError(null);
  }, [form, group, isOpen]);

  const onSubmit = form.handleSubmit((values) => {
    setServerError(null);
    startTransition(async () => {
      const action = group ? updateGroupAction : createGroupAction;
      const result = await action(values);

      if (!result.success && result.fieldErrors) {
        Object.entries(result.fieldErrors).forEach(([field, messages]) => {
          if (!messages?.length) {
            return;
          }

          form.setError(field as keyof GroupInput, { type: "server", message: messages[0] });
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
      title={group ? "Editar grupo" : "Crear grupo"}
      description="Guarda la información base del grupo para organizar tus estudiantes."
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">Nombre del grupo</label>
            <input
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
              placeholder="7A, Matemáticas 10B..."
              {...form.register("name")}
            />
            <p className="text-xs text-rose-400">{form.formState.errors.name?.message}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">Nivel educativo</label>
            <input
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
              placeholder="Básica secundaria"
              {...form.register("level")}
            />
            <p className="text-xs text-rose-400">{form.formState.errors.level?.message}</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">Área</label>
            <input
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
              placeholder="Matemáticas, Lengua..."
              {...form.register("subject")}
            />
            <p className="text-xs text-rose-400">{form.formState.errors.subject?.message}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">Período</label>
            <input
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
              placeholder="2026-1"
              {...form.register("period")}
            />
            <p className="text-xs text-rose-400">{form.formState.errors.period?.message}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
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
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {group ? "Guardar cambios" : "Crear grupo"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
