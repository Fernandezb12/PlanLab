"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Lock } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Modal } from "@/components/ui/modal";
import { ToastMessage } from "@/components/ui/toast-message";
import { createClient } from "@/lib/supabase/client";
import { updatePasswordSchema, type UpdatePasswordInput } from "@/lib/validations/auth";

export const ChangePasswordButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const form = useForm<UpdatePasswordInput>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: { password: "", confirmPassword: "" }
  });

  const handleSubmit = form.handleSubmit(async ({ password }) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        console.error("Error real actualizando contraseña desde perfil:", error);
        setErrorMessage("No fue posible actualizar la contraseña. Intenta nuevamente.");
        return;
      }

      form.reset({ password: "", confirmPassword: "" });
      setIsOpen(false);
      setToast("Tu contraseña fue actualizada correctamente.");
    } catch (error) {
      console.error("Error real cambiando contraseña desde perfil:", error);
      setErrorMessage("No fue posible actualizar la contraseña en este momento.");
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <>
      {toast ? <ToastMessage message={toast} tone="success" onClose={() => setToast(null)} /> : null}

      <button
        type="button"
        onClick={() => {
          setErrorMessage(null);
          setIsOpen(true);
        }}
        className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold transition hover:bg-slate-100 dark:border-white/10 dark:hover:bg-white/10"
      >
        <Lock className="h-4 w-4" />
        Cambiar contraseña
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => {
          if (!isSubmitting) {
            setIsOpen(false);
          }
        }}
        title="Cambiar contraseña"
        description="Actualiza tu contraseña de acceso a PlanLab."
        contentClassName="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Nueva contraseña</label>
            <input
              type="password"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-950/70 dark:text-white"
              placeholder="Mínimo 8 caracteres"
              {...form.register("password")}
            />
            <p className="text-xs text-rose-500">{form.formState.errors.password?.message}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Confirmar contraseña</label>
            <input
              type="password"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-950/70 dark:text-white"
              placeholder="Repite la contraseña"
              {...form.register("confirmPassword")}
            />
            <p className="text-xs text-rose-500">{form.formState.errors.confirmPassword?.message}</p>
          </div>

          {errorMessage ? <p className="rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-900 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-100">{errorMessage}</p> : null}

          <div className="flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
              Guardar contraseña
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};
