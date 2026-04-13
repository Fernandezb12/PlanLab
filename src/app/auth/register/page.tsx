import Link from "next/link";

import { RegisterOnboardingForm } from "@/features/auth/register-onboarding-form";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8 text-slate-100">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-brand-500">Onboarding docente</p>
          <h1 className="text-4xl font-bold leading-tight">Configura tu espacio pedagógico en 2 minutos.</h1>
          <p className="mt-4 text-slate-300">Tu cuenta te permitirá diseñar planes por nivel educativo, organizar actividades y crear reportes claros para tu comunidad escolar.</p>
          <div className="mt-8 rounded-2xl bg-slate-800/70 p-4 text-sm text-slate-200">
            <p className="font-semibold text-white">Incluye desde el primer día:</p>
            <p className="mt-2">Estructura de planificación, seguimiento de resultados y base de reportes exportables.</p>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Registro</p>
          <h2 className="mt-2 text-2xl font-bold">Crea tu cuenta de docente</h2>
          <p className="mt-1 text-xs font-medium text-brand-600">Paso 1 de 1 · Perfil inicial</p>
          <p className="mt-2 mb-6 text-sm text-slate-500">Completa estos datos para activar una experiencia personalizada desde tu primer ingreso.</p>
          <RegisterOnboardingForm />
          <p className="mt-6 text-sm text-slate-500">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/auth/login" className="font-semibold text-brand-600 hover:text-brand-500">
              Iniciar sesión
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
