"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { type LoginInput, loginSchema } from "@/lib/validations/auth";

export const LoginForm = () => {
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" }
  });

  const onSubmit = form.handleSubmit((values) => {
    console.log("Mock login", values);
    alert("Ingreso simulado. En la siguiente fase conectaremos autenticación real.");
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">Correo institucional</label>
        <input className="w-full rounded-xl border border-slate-300 bg-white/70 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950/60" {...form.register("email")} />
        <p className="mt-1 text-xs text-rose-500">{form.formState.errors.email?.message}</p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">Contraseña</label>
        <input type="password" className="w-full rounded-xl border border-slate-300 bg-white/70 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950/60" {...form.register("password")} />
        <p className="mt-1 text-xs text-rose-500">{form.formState.errors.password?.message}</p>
      </div>

      <button type="submit" className="w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-500">
        Entrar al dashboard
      </button>
    </form>
  );
};
