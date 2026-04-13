import Image from "next/image";
import Link from "next/link";
import { BookOpenCheck, LayoutTemplate, LineChart } from "lucide-react";

import { RegisterOnboardingForm } from "@/features/auth/register-onboarding-form";

const onboardingSteps = [
  { icon: LayoutTemplate, title: "Define tu perfil", text: "Configuro tu entorno según tu contexto educativo." },
  { icon: BookOpenCheck, title: "Crea tus primeros planes", text: "Comienza con una base clara para planificar clases." },
  { icon: LineChart, title: "Haz seguimiento", text: "Visualiza avances y reporta resultados con claridad." }
];

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <section className="order-2 rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900 lg:order-1">
          <div className="mb-8 flex items-center gap-3">
            <div className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-xl bg-brand-600 font-bold text-white">
              <Image src="/logo.png" alt="PlanLab" fill sizes="40px" className="object-cover" />
              <span className="relative">PL</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">PlanLab</p>
              <p className="text-xs text-slate-500">Onboarding docente</p>
            </div>
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Registro</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">Crea tu espacio de trabajo docente</h1>
          <p className="mt-2 mb-7 text-sm text-slate-500">Este onboarding inicial deja lista tu cuenta para planificar, ejecutar actividades y evaluar progresos desde el primer día.</p>

          <RegisterOnboardingForm />

          <p className="mt-7 text-sm text-slate-500">
            ¿Ya tienes cuenta?{" "}
            <Link href="/auth/login" className="font-semibold text-brand-600 hover:text-brand-500">
              Iniciar sesión
            </Link>
          </p>
        </section>

        <section className="order-1 rounded-3xl border border-slate-800 bg-slate-900/70 p-8 text-slate-100 lg:order-2">
          <p className="inline-flex rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-300">Onboarding guiado</p>
          <h2 className="mt-5 text-4xl font-bold leading-tight">Comienza con una base sólida para todo tu año escolar.</h2>
          <p className="mt-4 text-slate-300">El flujo de registro está diseñado para ayudarte a partir con estructura, foco pedagógico y claridad operativa.</p>

          <div className="mt-9 space-y-4">
            {onboardingSteps.map((step, index) => (
              <div key={step.title} className="relative rounded-2xl border border-slate-800 bg-slate-950/70 p-4 pl-12">
                <div className="absolute left-4 top-4 grid h-6 w-6 place-items-center rounded-full bg-brand-600/20 text-xs font-semibold text-brand-300">{index + 1}</div>
                <div className="mb-1 flex items-center gap-2">
                  <step.icon className="h-4 w-4 text-brand-400" />
                  <p className="text-sm font-semibold text-white">{step.title}</p>
                </div>
                <p className="text-sm text-slate-300">{step.text}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
