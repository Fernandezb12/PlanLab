"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { educationLevels, type RegisterInput, registerSchema } from "@/lib/validations/auth";

export const RegisterOnboardingForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      mainEducationLevel: undefined
    }
  });

  const onSubmit = form.handleSubmit((values) => {
    console.log("Mock register", values);
    alert("Onboarding simulado completado. Próximo paso: activación real con Supabase.");
  });

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="rounded-2xl border border-brand-100 bg-brand-50/70 p-3 text-xs text-brand-700 dark:border-brand-900/40 dark:bg-brand-900/20 dark:text-brand-200">
        Completa este perfil para personalizar tus flujos de planificación y seguimiento docente.
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">Nombre completo</label>
        <input className="w-full rounded-xl border border-slate-300 bg-white/70 px-3 py-2.5 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-950/60" {...form.register("fullName")} />
        <p className="mt-1 text-xs text-rose-500">{form.formState.errors.fullName?.message}</p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">Correo</label>
        <input className="w-full rounded-xl border border-slate-300 bg-white/70 px-3 py-2.5 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-950/60" {...form.register("email")} />
        <p className="mt-1 text-xs text-rose-500">{form.formState.errors.email?.message}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">Contraseña</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full rounded-xl border border-slate-300 bg-white/70 px-3 py-2.5 pr-11 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-950/60"
              {...form.register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="mt-1 text-xs text-rose-500">{form.formState.errors.password?.message}</p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">Confirmar contraseña</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              className="w-full rounded-xl border border-slate-300 bg-white/70 px-3 py-2.5 pr-11 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-950/60"
              {...form.register("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label={showConfirmPassword ? "Ocultar confirmación" : "Mostrar confirmación"}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="mt-1 text-xs text-rose-500">{form.formState.errors.confirmPassword?.message}</p>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">Nivel educativo principal</label>
        <select className="w-full rounded-xl border border-slate-300 bg-white/70 px-3 py-2.5 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-950/60" {...form.register("mainEducationLevel")}>
          <option value="">Selecciona una opción</option>
          {educationLevels.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-rose-500">{form.formState.errors.mainEducationLevel?.message}</p>
      </div>

      <button type="submit" className="w-full rounded-xl bg-gradient-to-r from-brand-600 to-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-95">
        Crear cuenta y comenzar
      </button>
    </form>
  );
};
