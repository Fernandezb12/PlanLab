"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { ForgotPasswordDialog } from "@/features/auth/forgot-password-dialog";
import { createClient } from "@/lib/supabase/client";
import { mapLoginErrorMessage } from "@/lib/supabase/auth-errors";
import { type LoginInput, loginSchema } from "@/lib/validations/auth";

type LoginFormProps = {
  nextPath?: string | null;
};

export const LoginForm = ({ nextPath }: LoginFormProps) => {
  // Controlo visibilidad para que el usuario pueda validar lo que escribe.
  const [showPassword, setShowPassword] = useState(false);
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" }
  });

  // Yo autentico directo con Supabase para habilitar acceso real al panel.
  const onSubmit = form.handleSubmit(async (values) => {
    setAuthError(null);
    setIsSubmitting(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password
    });

    if (error) {
      setAuthError(mapLoginErrorMessage(error));
      setIsSubmitting(false);
      return;
    }

    router.push(nextPath && nextPath.startsWith("/") ? nextPath : "/dashboard");
    router.refresh();
  });

  return (
    <>
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Correo institucional</label>
          <input
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-950/70"
            placeholder="profe@colegio.edu"
            {...form.register("email")}
          />
          <p className="text-xs text-rose-500">{form.formState.errors.email?.message}</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Contraseña</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-12 text-sm shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-950/70"
              placeholder="••••••••"
              {...form.register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-xs text-rose-500">{form.formState.errors.password?.message}</p>
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
            Recordarme
          </label>
          <button
            type="button"
            onClick={() => setIsRecoveryOpen(true)}
            className="font-medium text-brand-600 transition hover:text-brand-500"
          >
            Olvidé mi contraseña
          </button>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-indigo-500 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-900/25 transition hover:-translate-y-0.5 hover:shadow-xl"
        >
          {isSubmitting ? "Ingresando..." : "Entrar a PlanLab"}
        </button>
        {authError ? <p className="text-sm text-rose-500">{authError}</p> : null}
      </form>
      <ForgotPasswordDialog isOpen={isRecoveryOpen} onClose={() => setIsRecoveryOpen(false)} />
    </>
  );
};
