import Link from "next/link";

import { ThemeToggle } from "@/components/shared/theme-toggle";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-50 to-white px-6 py-10 dark:from-slate-950 dark:to-slate-900">
      <div className="mx-auto max-w-6xl">
        <header className="mb-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl border border-dashed border-brand-500/60 bg-white text-center leading-10 dark:bg-slate-900">
              PL
            </div>
            <div>
              <p className="text-lg font-bold text-brand-600">PlanLab</p>
              <p className="text-xs text-slate-500">Espacio listo para /public/logo.png</p>
            </div>
          </div>
          <ThemeToggle />
        </header>

        <section className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <p className="mb-2 inline-flex rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">EDTECH PREMIUM</p>
            <h1 className="mb-4 text-5xl font-extrabold leading-tight">Planifica, ejecuta y reporta con una sola plataforma docente.</h1>
            <p className="mb-8 text-slate-600 dark:text-slate-300">PlanLab transforma tu flujo pedagógico: planificaciones, actividades, resultados y reportes con IA y datos accionables.</p>
            <div className="flex gap-3">
              <Link href="/auth/login" className="rounded-xl bg-brand-600 px-5 py-3 font-semibold text-white hover:bg-brand-500">Iniciar sesión</Link>
              <Link href="/auth/register" className="rounded-xl border border-slate-300 px-5 py-3 font-semibold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800">Crear cuenta</Link>
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <p className="mb-4 text-sm font-semibold text-slate-500">Vista previa dashboard</p>
            <div className="space-y-3">
              {[
                "Planificaciones alineadas al currículum",
                "Generación de actividades con IA",
                "Seguimiento de resultados por estudiante",
                "Reportes exportables PDF"
              ].map((feature) => (
                <div key={feature} className="rounded-xl bg-slate-100 px-4 py-3 text-sm dark:bg-slate-800">{feature}</div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
