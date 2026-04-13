"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { educationLevels, type RegisterInput, registerSchema } from "@/lib/validations/auth";

export const RegisterOnboardingForm = () => {
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
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">Nombre completo</label>
        <input className="w-full rounded-xl border border-slate-300 bg-white/70 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950/60" {...form.register("fullName")} />
        <p className="mt-1 text-xs text-rose-500">{form.formState.errors.fullName?.message}</p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">Correo</label>
        <input className="w-full rounded-xl border border-slate-300 bg-white/70 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950/60" {...form.register("email")} />
        <p className="mt-1 text-xs text-rose-500">{form.formState.errors.email?.message}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">Contraseña</label>
          <input type="password" className="w-full rounded-xl border border-slate-300 bg-white/70 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950/60" {...form.register("password")} />
          <p className="mt-1 text-xs text-rose-500">{form.formState.errors.password?.message}</p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">Confirmar contraseña</label>
          <input type="password" className="w-full rounded-xl border border-slate-300 bg-white/70 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950/60" {...form.register("confirmPassword")} />
          <p className="mt-1 text-xs text-rose-500">{form.formState.errors.confirmPassword?.message}</p>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">Nivel educativo principal</label>
        <select className="w-full rounded-xl border border-slate-300 bg-white/70 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950/60" {...form.register("mainEducationLevel")}>
          <option value="">Selecciona una opción</option>
          {educationLevels.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-rose-500">{form.formState.errors.mainEducationLevel?.message}</p>
      </div>

      <button type="submit" className="w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-500">
        Crear cuenta y comenzar
      </button>
    </form>
  );
};
