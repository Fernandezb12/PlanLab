import Link from "next/link";
import { ArrowLeft, BarChart3, ShieldCheck, Sparkles } from "lucide-react";

import { PlanLabBrand } from "@/components/branding/planlab-brand";
import { LoginForm } from "@/features/auth/login-form";

const loginHighlights = [
  { icon: ShieldCheck, text: "Acceso seguro para equipos docentes." },
  { icon: BarChart3, text: "Monitorea resultados y progreso sin fricción." },
  { icon: Sparkles, text: "Flujo rápido para retomar tu jornada pedagógica." }
];

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const nextPath = typeof resolvedSearchParams.next === "string" ? resolvedSearchParams.next : null;
  const statusMessage = resolvedSearchParams.message === "password_updated" ? "Tu contraseña fue actualizada correctamente. Ya puedes iniciar sesión." : null;
  const errorMessage = resolvedSearchParams.error === "recovery_failed" ? "El enlace no es válido o expiró. Solicita uno nuevo." : null;

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-8 dark:bg-slate-950">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center">
        <div className="grid w-full overflow-hidden rounded-3xl border border-slate-200 bg-white/80 shadow-2xl dark:border-slate-800 dark:bg-slate-900/60 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="relative p-8 md:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(46,122,247,0.25),transparent_45%)]" />
            <div className="relative z-10">
              <div className="mb-10 flex items-center gap-3">
                <div className="min-w-0 py-1">
                  <PlanLabBrand kind="full" priority className="max-w-[188px]" />
                  <p className="mt-2.5 pl-1 text-xs text-slate-500 dark:text-slate-400">Acceso profesional docente</p>
                </div>
              </div>

              <p className="inline-flex rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-700 dark:text-brand-300">Ingreso rápido</p>
              <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white md:text-5xl">Bienvenido nuevamente.</h1>
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
            <Link href="/" className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-brand-600">
              <ArrowLeft className="h-4 w-4" />
              Volver al inicio
            </Link>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Login</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Accede a tu espacio</h2>
            <p className="mb-8 mt-2 text-sm text-slate-500">Tu panel te espera con planes, actividades y reportes listos para trabajar.</p>

            {statusMessage ? (
              <div className="mb-5 rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-100">
                {statusMessage}
              </div>
            ) : null}

            {errorMessage ? (
              <div className="mb-5 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-100">
                {errorMessage}
              </div>
            ) : null}

            <LoginForm nextPath={nextPath} />

            <p className="mt-8 text-sm text-slate-500">
              ¿Aún no tienes cuenta?{" "}
              <Link href="/auth/register" className="font-semibold text-brand-600 hover:text-brand-500">
                Registro docente
              </Link>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
