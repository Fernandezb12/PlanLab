"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { createClient } from "@/lib/supabase/client";
import { updatePasswordSchema, type UpdatePasswordInput } from "@/lib/validations/auth";

type RecoveryState = "checking" | "ready" | "invalid" | "success";

export const UpdatePasswordForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [recoveryState, setRecoveryState] = useState<RecoveryState>("checking");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<UpdatePasswordInput>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: { password: "", confirmPassword: "" }
  });

  useEffect(() => {
    let mounted = true;

    const prepareRecoverySession = async () => {
      const supabase = createClient();
      const code = searchParams.get("code");
      const authError = searchParams.get("error");
      const authErrorCode = searchParams.get("error_code");

      try {
        if (authError || authErrorCode) {
          console.error("Error real recibido desde enlace de recuperación:", { authError, authErrorCode });

          if (mounted) {
            setRecoveryState("invalid");
          }

          return;
        }

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            console.error("Error real intercambiando código de recuperación:", error);

            if (mounted) {
              setRecoveryState("invalid");
            }

            return;
          }
        }

        const {
          data: { session },
          error
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Error real obteniendo sesión de recuperación:", error);
        }

        if (mounted) {
          setRecoveryState(session ? "ready" : "invalid");
        }
      } catch (error) {
        console.error("Error real preparando sesión de recuperación:", error);

        if (mounted) {
          setRecoveryState("invalid");
        }
      }
    };

    void prepareRecoverySession();

    return () => {
      mounted = false;
    };
  }, [searchParams]);

  const onSubmit = form.handleSubmit(async ({ password }) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        console.error("Error real actualizando contraseña:", error);
        setErrorMessage("No fue posible actualizar la contraseña. Solicita un nuevo enlace e inténtalo otra vez.");
        return;
      }

      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        console.error("Error real cerrando sesión después de actualizar contraseña:", signOutError);
      }

      setRecoveryState("success");
      form.reset({ password: "", confirmPassword: "" });

      window.setTimeout(() => {
        router.push("/auth/login?message=password-updated");
        router.refresh();
      }, 1800);
    } catch (error) {
      console.error("Error real en cambio de contraseña:", error);
      setErrorMessage("No fue posible actualizar la contraseña en este momento.");
    } finally {
      setIsSubmitting(false);
    }
  });

  if (recoveryState === "checking") {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
        Validando enlace seguro...
      </div>
    );
  }

  if (recoveryState === "invalid") {
    return (
      <div className="space-y-5 rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-950 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-100">
        <p className="font-semibold">El enlace no es válido o expiró.</p>
        <p>Solicita uno nuevo desde la pantalla de inicio de sesión.</p>
        <Link href="/auth/login" className="inline-flex rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110">
          Volver al login
        </Link>
      </div>
    );
  }

  if (recoveryState === "success") {
    return (
      <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-5 text-sm text-emerald-950 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-100">
        <CheckCircle2 className="mb-3 h-5 w-5" />
        Tu contraseña fue actualizada correctamente.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
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

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-indigo-500 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-900/25 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
        Actualizar contraseña
      </button>
    </form>
  );
};
