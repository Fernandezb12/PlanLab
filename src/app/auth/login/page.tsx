import Link from "next/link";

import { LoginForm } from "@/features/auth/login-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8 text-slate-100">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-brand-500">PlanLab</p>
          <h1 className="text-4xl font-bold leading-tight">Bienvenido de vuelta.</h1>
          <p className="mt-4 text-slate-300">Retoma tu planificación, revisa actividades pendientes y monitorea resultados de aprendizaje en minutos.</p>
          <ul className="mt-8 space-y-3 text-sm text-slate-300">
            <li>• Planificaciones centralizadas por curso.</li>
            <li>• Seguimiento de desempeño con foco pedagógico.</li>
            <li>• Reportes listos para compartir con tu equipo.</li>
          </ul>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Acceso</p>
          <h2 className="mt-2 text-2xl font-bold">Inicia sesión</h2>
          <p className="mt-2 mb-6 text-sm text-slate-500">Ingresa con tus credenciales para continuar donde quedaste.</p>
          <LoginForm />
          <p className="mt-6 text-sm text-slate-500">
            ¿Nuevo en PlanLab?{" "}
            <Link href="/auth/register" className="font-semibold text-brand-600 hover:text-brand-500">
              Crear cuenta docente
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
