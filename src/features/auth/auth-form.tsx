"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { authSchema, type AuthInput } from "@/lib/validations/auth";

export const AuthForm = () => {
  const form = useForm<AuthInput>({
    resolver: zodResolver(authSchema),
    defaultValues: { email: "", password: "" }
  });

  const onSubmit = form.handleSubmit((values) => {
    console.log("Mock auth", values);
    alert("Autenticación mock enviada. Integra Supabase en siguiente entrega.");
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <div>
        <label className="mb-1 block text-sm font-medium">Email</label>
        <input className="w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2" {...form.register("email")} />
        <p className="mt-1 text-xs text-red-500">{form.formState.errors.email?.message}</p>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Contraseña</label>
        <input type="password" className="w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2" {...form.register("password")} />
        <p className="mt-1 text-xs text-red-500">{form.formState.errors.password?.message}</p>
      </div>
      <button type="submit" className="w-full rounded-lg bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-500">
        Continuar
      </button>
    </form>
  );
};
