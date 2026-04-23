import Link from "next/link";
import { ArrowLeft, BookOpenCheck, LayoutTemplate, LineChart } from "lucide-react";

import { PlanLabBrand } from "@/components/branding/planlab-brand";
import { RegisterOnboardingForm } from "@/features/auth/register-onboarding-form";

const firstSteps = [
  { icon: LayoutTemplate, title: "Define tu perfil", text: "Configuro tu entorno según tu contexto educativo." },
  { icon: BookOpenCheck, title: "Crea tus primeros planes", text: "Comienza con una base clara para planificar clases." },
  { icon: LineChart, title: "Haz seguimiento", text: "Visualiza avances y reporta resultados con claridad." }
];

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-slate-100 px-6 py-8 dark:bg-slate-950">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl content-center gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <section className="order-2 rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900 lg:order-1">
          <Link href="/" className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-brand-600">
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>

          <div className="mb-8 py-1">
            <PlanLabBrand kind="full" priority className="max-w-[188px]" />
            <p className="mt-2.5 pl-1 text-xs text-slate-500">Registro docente</p>
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Crear cuenta</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Crea tu espacio docente</h1>
          <p className="mt-2 mb-7 text-sm text-slate-500">Configura tu cuenta para planificar, ejecutar actividades y evaluar progresos desde el primer día.</p>

          <RegisterOnboardingForm />

          <p className="mt-7 text-sm text-slate-500">
            ¿Ya tienes cuenta?{" "}
            <Link href="/auth/login" className="font-semibold text-brand-600 hover:text-brand-500">
              Iniciar sesión
            </Link>
          </p>
        </section>

        <section className="order-1 rounded-3xl border border-slate-200 bg-white/80 p-8 text-slate-900 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-100 lg:order-2">
          <p className="inline-flex rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-700 dark:text-brand-300">Primeros pasos</p>
          <h2 className="mt-5 text-4xl font-bold leading-tight tracking-tight">Comienza con una base sólida para todo tu año escolar.</h2>
          <p className="mt-4 text-slate-700 dark:text-slate-300">Este registro está diseñado para ayudarte a partir con estructura, foco pedagógico y claridad operativa.</p>

          <div className="mt-9 space-y-4">
            {firstSteps.map((step, index) => (
              <div key={step.title} className="relative rounded-2xl border border-slate-200 bg-white p-4 pl-12 dark:border-slate-800 dark:bg-slate-950/70">
                <div className="absolute left-4 top-4 grid h-6 w-6 place-items-center rounded-full bg-brand-600/20 text-xs font-semibold text-brand-600 dark:text-brand-300">{index + 1}</div>
                <div className="mb-1 flex items-center gap-2">
                  <step.icon className="h-4 w-4 text-brand-500 dark:text-brand-400" />
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{step.title}</p>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300">{step.text}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
