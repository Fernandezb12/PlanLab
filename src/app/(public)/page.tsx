import Image from "next/image";
import Link from "next/link";

import { ThemeToggle } from "@/components/shared/theme-toggle";

const highlights = [
  "Planificaciones listas en menos tiempo",
  "Actividades conectadas al objetivo de aprendizaje",
  "Panel de resultados con lectura rápida",
  "Reportes claros para liderazgo pedagógico"
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-6xl">
        <header className="mb-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative grid h-11 w-11 place-items-center overflow-hidden rounded-xl bg-brand-600 font-bold text-white shadow-lg shadow-brand-900/40">
              <Image src="/logo.png" alt="PlanLab" fill sizes="44px" className="absolute inset-0 h-full w-full object-cover" />
              <span className="relative">PL</span>
            </div>
            <div>
              <p className="text-lg font-bold">PlanLab</p>
              <p className="text-xs text-slate-400">Plataforma premium para planificación docente</p>
            </div>
          </div>
          <ThemeToggle />
        </header>

        <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <p className="mb-3 inline-flex rounded-full border border-brand-500/40 bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-300">Impulsa tu planificación pedagógica</p>
            <h1 className="text-5xl font-extrabold leading-tight md:text-6xl">PlanLab convierte la planificación docente en una experiencia ágil y elegante.</h1>
            <p className="mt-6 max-w-2xl text-lg text-slate-300">Diseña clases, organiza actividades, interpreta resultados y prepara reportes desde un solo lugar, con una experiencia pensada para equipos pedagógicos modernos.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/auth/register" className="rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-500">Comenzar onboarding</Link>
              <Link href="/auth/login" className="rounded-xl border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800">Ya tengo cuenta</Link>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-400">Qué puedes lograr con PlanLab</p>
            <div className="mt-4 space-y-3">
              {highlights.map((item) => (
                <div key={item} className="rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-slate-200">
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-500 p-4 text-sm text-white">
              Una experiencia enfocada en decisiones pedagógicas más rápidas, claras y accionables.
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
