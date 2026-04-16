import Image from "next/image";
import Link from "next/link";
import { Bot, FileText, ShieldCheck, Sparkles, Wand2 } from "lucide-react";

import { ScrollReveal } from "@/components/landing/scroll-reveal";
import { SectionTitle } from "@/components/landing/section-title";
import { ThemeToggle } from "@/components/shared/theme-toggle";

const benefits = [
  {
    title: "Planeación estructurada",
    text: "Diseña clases con objetivos claros, secuencia didáctica y foco en aprendizaje real."
  },
  {
    title: "Ajuste inteligente del tiempo de clase",
    text: "Distribuye mejor cada bloque para cubrir contenidos sin perder ritmo pedagógico."
  },
  {
    title: "Registro de asistencia y resultados",
    text: "Consolida evidencias de avance por estudiante y grupo en un solo panel."
  },
  {
    title: "Alertas y reportes pedagógicos",
    text: "Identifica brechas a tiempo y comparte reportes claros con tu equipo académico."
  }
];

const modules = ["Planes", "Actividades", "Resultados", "Reportes", "Refuerzo pedagógico"];
const flow = ["Crear plan", "Convertir en actividad", "Registrar resultados", "Analizar y reforzar"];

const tech = [
  { icon: Bot, title: "IA con Gemini", text: "Te ayuda a proponer ideas y mejorar la planificación con lenguaje natural." },
  { icon: ShieldCheck, title: "Seguridad de datos", text: "Protección de información académica con prácticas modernas de acceso seguro." },
  { icon: FileText, title: "Exportación PDF", text: "Genera reportes profesionales listos para compartir con familias y dirección." },
  { icon: Sparkles, title: "Experiencia web moderna", text: "Interfaz rápida, intuitiva y pensada para docentes en su trabajo diario." }
];

export default function LandingPage() {
  return (
    <main className="scroll-smooth bg-slate-100 text-slate-900 dark:bg-[#070915] dark:text-slate-100">
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-60 dark:bg-[radial-gradient(circle_at_top_right,rgba(109,40,217,0.3),transparent_35%),radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.28),transparent_35%),radial-gradient(circle_at_70%_80%,rgba(245,158,11,0.2),transparent_30%)]" />

      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/75 backdrop-blur-md dark:border-slate-800/60 dark:bg-slate-950/55">
        <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-xl bg-brand-600 text-sm font-bold text-white shadow-lg shadow-brand-900/35">
              <Image src="/logo.png" alt="PlanLab" fill sizes="40px" className="object-cover" />
              <span className="relative">PL</span>
            </div>
            <span className="font-semibold tracking-wide">PlanLab</span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm text-slate-600 dark:text-slate-300 md:flex">
            <a href="#beneficios" className="transition hover:text-brand-600">Beneficios</a>
            <a href="#modulos" className="transition hover:text-brand-600">Módulos</a>
            <a href="#tecnologia" className="transition hover:text-brand-600">Tecnología</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800">
              Iniciar sesión
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-7xl gap-10 px-6 pb-24 pt-16 md:grid-cols-[1.08fr_0.92fr] md:items-center">
        <ScrollReveal>
          <p className="inline-flex rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-700 dark:text-brand-300">
            Plataforma docente inteligente
          </p>
          <h1 className="mt-6 text-5xl font-extrabold leading-tight tracking-tight md:text-6xl">
            Planifica, registra y mejora tus clases con claridad pedagógica.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
            PlanLab integra planeación, actividades, resultados y reportes en una experiencia premium para que enseñes con más foco y menos carga operativa.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/auth/register" className="rounded-xl bg-gradient-to-r from-brand-600 via-blue-600 to-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-900/30 transition hover:-translate-y-0.5 hover:shadow-xl">
              Crear cuenta
            </Link>
            <Link href="/auth/login" className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
              Iniciar sesión
            </Link>
          </div>
        </ScrollReveal>

        <ScrollReveal className="md:justify-self-end">
          <div className="glass-card relative overflow-hidden rounded-3xl p-6">
            <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-brand-500/25 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-amber-400/20 blur-3xl" />

            <div className="relative space-y-4">
              <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-brand-300">Clase próxima</p>
                <p className="mt-2 text-lg font-semibold">Fracciones equivalentes · 5° Básico</p>
                <p className="mt-1 text-sm text-slate-300">Objetivo claro + actividades secuenciadas + evaluación formativa.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-4">
                  <p className="text-xs text-slate-400">Asistencia</p>
                  <p className="mt-2 text-2xl font-bold text-emerald-300">94%</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-4">
                  <p className="text-xs text-slate-400">Logro OA</p>
                  <p className="mt-2 text-2xl font-bold text-amber-300">78%</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <section id="beneficios" className="mx-auto w-full max-w-7xl px-6 py-16">
        <ScrollReveal>
          <SectionTitle
            badge="Beneficios"
            title="Todo lo que necesitas para enseñar con mejor estructura"
            description="PlanLab te acompaña en cada etapa del ciclo pedagógico con herramientas concretas y fáciles de usar."
          />
        </ScrollReveal>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {benefits.map((benefit) => (
            <ScrollReveal key={benefit.title}>
              <article className="glass-card rounded-2xl p-5">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{benefit.title}</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{benefit.text}</p>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 py-16">
        <ScrollReveal>
          <SectionTitle
            badge="Cómo funciona"
            title="Un flujo claro en 4 pasos"
            description="Transforma tu planificación en acciones concretas y decisiones pedagógicas oportunas."
          />
        </ScrollReveal>

        <div className="mt-10 grid gap-4 md:grid-cols-4">
          {flow.map((step, index) => (
            <ScrollReveal key={step}>
              <div className="glass-card rounded-2xl p-5">
                <p className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-500/15 text-sm font-semibold text-brand-700 dark:text-brand-300">
                  {index + 1}
                </p>
                <p className="mt-4 font-medium">{step}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section id="modulos" className="mx-auto w-full max-w-7xl px-6 py-16">
        <ScrollReveal>
          <SectionTitle
            badge="Módulos"
            title="Un ecosistema completo para la gestión pedagógica"
            description="Cada módulo está diseñado para conectarse naturalmente con el siguiente."
          />
        </ScrollReveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {modules.map((module) => (
            <ScrollReveal key={module}>
              <div className="glass-card rounded-2xl p-5 text-center">
                <Wand2 className="mx-auto h-5 w-5 text-brand-500 dark:text-brand-300" />
                <p className="mt-3 text-sm font-semibold">{module}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section id="tecnologia" className="mx-auto w-full max-w-7xl px-6 py-16">
        <ScrollReveal>
          <SectionTitle
            badge="Tecnología"
            title="Innovación aplicada al trabajo docente"
            description="Tecnología potente detrás de una experiencia simple, útil y confiable."
          />
        </ScrollReveal>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {tech.map((item) => (
            <ScrollReveal key={item.title}>
              <article className="glass-card rounded-2xl p-5">
                <item.icon className="h-5 w-5 text-brand-500 dark:text-brand-300" />
                <h3 className="mt-3 font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.text}</p>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white/70 px-6 py-10 dark:border-slate-800 dark:bg-slate-950/60">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-lg bg-brand-600 font-bold text-white">
              <Image src="/logo.png" alt="PlanLab" fill sizes="36px" className="object-cover" />
              <span className="relative text-xs">PL</span>
            </div>
            <div>
              <p className="text-sm font-semibold">PlanLab</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Planificación docente inteligente</p>
            </div>
          </div>

          <div className="flex items-center gap-5 text-sm text-slate-500 dark:text-slate-400">
            <a href="#beneficios" className="hover:text-brand-600">Beneficios</a>
            <a href="#modulos" className="hover:text-brand-600">Módulos</a>
            <a href="#tecnologia" className="hover:text-brand-600">Tecnología</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
