import Image from "next/image";
import Link from "next/link";
import { BarChart3, ShieldCheck, Sparkles } from "lucide-react";

import { LoginForm } from "@/features/auth/login-form";

const loginHighlights = [
  { icon: ShieldCheck, text: "Acceso seguro para equipos docentes." },
  { icon: BarChart3, text: "Monitorea resultados y progreso sin fricción." },
  { icon: Sparkles, text: "Flujo rápido para retomar tu jornada pedagógica." }
];

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-100 px-6 py-10 dark:bg-slate-950">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-white/80 shadow-2xl dark:border-slate-800 dark:bg-slate-900/60 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="relative p-8 md:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(46,122,247,0.25),transparent_45%)]" />
          <div className="relative z-10">
            <div className="mb-10 flex items-center gap-3">
              <div className="relative grid h-11 w-11 place-items-center overflow-hidden rounded-xl bg-brand-600 font-bold text-white">
                <Image src="/logo.png" alt="PlanLab" fill sizes="44px" className="object-cover" />
                <span className="relative">PL</span>
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900 dark:text-white">PlanLab</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Acceso profesional docente</p>
              </div>
            </div>

            <p className="inline-flex rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-700 dark:text-brand-300">Ingreso rápido</p>
            <h1 className="mt-5 text-4xl font-bold leading-tight text-slate-900 dark:text-white md:text-5xl">Bienvenido nuevamente.</h1>
            <p className="mt-4 max-w-xl text-slate-700 dark:text-slate-300">Ingresa en segundos para continuar tu planificación, revisar actividades pendientes y mantener el seguimiento pedagógico al día.</p>

            <div className="mt-10 space-y-4">
              {loginHighlights.map((item) => (
                <div key={item.text} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950/70">
                  <item.icon className="h-4 w-4 text-brand-500 dark:text-brand-400" />
                  <p className="text-sm text-slate-700 dark:text-slate-200">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-slate-200 bg-white p-8 md:p-10 lg:border-l lg:border-t-0 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Login</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">Accede a tu espacio</h2>
          <p className="mb-8 mt-2 text-sm text-slate-500">Tu panel te espera con planes, actividades y reportes listos para trabajar.</p>

          <LoginForm />

          <p className="mt-8 text-sm text-slate-500">
            ¿Aún no tienes cuenta?{" "}
            <Link href="/auth/register" className="font-semibold text-brand-600 hover:text-brand-500">
              Registro docente
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
