"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, GraduationCap, Mail, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { createClient } from "@/lib/supabase/client";
import { mapRegisterErrorMessage } from "@/lib/supabase/auth-errors";
import { educationLevels, type RegisterInput, registerSchema } from "@/lib/validations/auth";

export const RegisterOnboardingForm = () => {
  // Estos estados solo afectan UI; no se guardan en backend.
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // React Hook Form + Zod permiten validar en cliente con mensajes consistentes.
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

  // Yo creo usuario real en Auth y persisto perfil docente en tabla profiles.
  const onSubmit = form.handleSubmit(async (values) => {
    setRegisterError(null);
    setIsSubmitting(true);
    const supabase = createClient();

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          full_name: values.fullName,
          main_education_level: values.mainEducationLevel
        }
      }
    });

    if (signUpError) {
      setRegisterError(mapRegisterErrorMessage(signUpError));
      setIsSubmitting(false);
      return;
    }

    if (!signUpData.session) {
      // Si el proyecto no confirma email, este login debería entrar de inmediato.
      const { error: loginAfterSignUpError } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password
      });

      if (loginAfterSignUpError) {
        setRegisterError("Tu cuenta fue creada, pero no pudimos iniciar sesión automáticamente.");
        setIsSubmitting(false);
        return;
      }
    }

    const { data: authData } = await supabase.auth.getUser();
    const authUser = authData.user;

    if (authUser) {
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: authUser.id,
        full_name: values.fullName,
        email: values.email,
        main_education_level: values.mainEducationLevel
      });

      if (profileError) {
        setRegisterError("La cuenta fue creada, pero no pudimos guardar tu perfil docente.");
        setIsSubmitting(false);
        return;
      }
    }

    router.push("/dashboard");
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="rounded-2xl border border-brand-100 bg-brand-50/70 p-4 dark:border-brand-900/40 dark:bg-brand-900/20">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700 dark:text-brand-200">Perfil inicial</p>
        <p className="mt-1 text-sm text-brand-800 dark:text-brand-100">Con estos datos preparo tu espacio de trabajo para planificar con foco pedagógico.</p>
      </div>

      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Identidad docente</p>

        <div>
          <label className="mb-1 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
            <User className="h-4 w-4 text-brand-500" /> Nombre completo
          </label>
          <input className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-950/70" {...form.register("fullName")} />
          <p className="mt-1 text-xs text-rose-500">{form.formState.errors.fullName?.message}</p>
        </div>

        <div>
          <label className="mb-1 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
            <Mail className="h-4 w-4 text-brand-500" /> Correo
          </label>
          <input className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-950/70" {...form.register("email")} />
          <p className="mt-1 text-xs text-rose-500">{form.formState.errors.email?.message}</p>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Seguridad de acceso</p>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-11 text-sm shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-950/70"
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
            <p className="mt-1 text-xs text-rose-500">{form.formState.errors.password?.message}</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Confirmar contraseña</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-11 text-sm shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-950/70"
                {...form.register("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label={showConfirmPassword ? "Ocultar confirmación" : "Mostrar confirmación"}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="mt-1 text-xs text-rose-500">{form.formState.errors.confirmPassword?.message}</p>
          </div>
        </div>
      </div>

      <div>
        <label className="mb-1 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
          <GraduationCap className="h-4 w-4 text-brand-500" /> Nivel educativo principal
        </label>
        <select className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-950/70" {...form.register("mainEducationLevel")}>
          <option value="">Selecciona una opción</option>
          {educationLevels.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-rose-500">{form.formState.errors.mainEducationLevel?.message}</p>
      </div>

      <button disabled={isSubmitting} type="submit" className="w-full rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-indigo-500 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-900/25 transition hover:-translate-y-0.5 hover:shadow-xl">
        {isSubmitting ? "Creando cuenta..." : "Crear cuenta y comenzar"}
      </button>
      {registerError ? <p className="text-sm text-rose-500">{registerError}</p> : null}
    </form>
  );
};
