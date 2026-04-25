import Link from "next/link";
import { ArrowLeft, KeyRound, ShieldCheck } from "lucide-react";
import { Suspense } from "react";

import { PlanLabBrand } from "@/components/branding/planlab-brand";
import { UpdatePasswordForm } from "@/features/auth/update-password-form";

export default function UpdatePasswordPage() {
  return (
    <main className="min-h-screen bg-slate-100 px-6 py-8 dark:bg-slate-950">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center">
        <div className="grid w-full overflow-hidden rounded-3xl border border-slate-200 bg-white/80 shadow-2xl dark:border-slate-800 dark:bg-slate-900/60 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="relative p-8 md:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.24),transparent_45%)]" />
            <div className="relative z-10">
              <div className="mb-10 py-1">
                <PlanLabBrand kind="full" priority className="max-w-[188px]" />
              </div>

              <p className="inline-flex rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-700 dark:text-brand-300">
                Acceso seguro
              </p>
              <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white md:text-5xl">
                Crea una nueva contraseña.
              </h1>
              <p className="mt-4 max-w-xl text-slate-700 dark:text-slate-300">
                Usa una contraseña segura para proteger tu espacio docente y continuar trabajando en PlanLab.
              </p>

              <div className="mt-10 space-y-4">
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950/70">
                  <ShieldCheck className="h-4 w-4 text-brand-500 dark:text-brand-400" />
                  <p className="text-sm text-slate-700 dark:text-slate-200">El enlace solo funciona durante un tiempo limitado.</p>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950/70">
                  <KeyRound className="h-4 w-4 text-brand-500 dark:text-brand-400" />
                  <p className="text-sm text-slate-700 dark:text-slate-200">La nueva contraseña debe tener mínimo 8 caracteres.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="border-t border-slate-200 bg-white p-8 md:p-10 lg:border-l lg:border-t-0 dark:border-slate-800 dark:bg-slate-900">
            <Link href="/auth/login" className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-brand-600">
              <ArrowLeft className="h-4 w-4" />
              Volver al login
            </Link>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Restablecer contraseña</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Actualiza tu acceso</h2>
            <p className="mb-8 mt-2 text-sm text-slate-500">Ingresa y confirma tu nueva contraseña para completar el proceso.</p>

            <Suspense fallback={<div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">Preparando formulario seguro...</div>}>
              <UpdatePasswordForm />
            </Suspense>
          </section>
        </div>
      </div>
    </main>
  );
}
