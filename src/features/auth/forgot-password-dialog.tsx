"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, MailCheck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Modal } from "@/components/ui/modal";
import { createClient } from "@/lib/supabase/client";
import { passwordRecoverySchema, type PasswordRecoveryInput } from "@/lib/validations/auth";

type ForgotPasswordDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

const recoveryMessage = "Te enviamos un enlace para restablecer tu contraseña. Revisa tu bandeja de entrada.";

export const ForgotPasswordDialog = ({ isOpen, onClose }: ForgotPasswordDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<PasswordRecoveryInput>({
    resolver: zodResolver(passwordRecoverySchema),
    defaultValues: { email: "" }
  });

  const handleSubmit = form.handleSubmit(async ({ email }) => {
    setIsSubmitting(true);
    setMessage(null);
    setErrorMessage(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/auth/update-password`
      });

      if (error) {
        console.error("Error real solicitando recuperación de contraseña:", error);
        setErrorMessage("No fue posible enviar el correo de recuperación en este momento.");
        return;
      }

      setMessage(recoveryMessage);
      form.reset({ email: "" });
    } catch (error) {
      console.error("Error real en recuperación de contraseña:", error);
      setErrorMessage("No fue posible completar la solicitud. Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isSubmitting) {
          onClose();
        }
      }}
      title="Restablecer contraseña"
      description="Ingresa tu correo y enviaremos un enlace seguro para crear una nueva contraseña."
      contentClassName="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
          <label className="text-sm font-medium text-slate-800 dark:text-slate-200">Correo institucional</label>
          <input
            type="email"
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-950/70 dark:text-white"
            placeholder="profe@colegio.edu"
            {...form.register("email")}
          />
          <p className="mt-1 text-xs text-rose-500">{form.formState.errors.email?.message}</p>
        </div>

        {message ? (
          <div className="rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-100">
            <MailCheck className="mr-2 inline h-4 w-4" />
            {message}
          </div>
        ) : null}

        {errorMessage ? (
          <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-100">
            {errorMessage}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
          >
            Cerrar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
            Enviar enlace
          </button>
        </div>
      </form>
    </Modal>
  );
};
