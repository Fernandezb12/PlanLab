import Link from "next/link";
import {
  BarChart3,
  Bot,
  BrainCircuit,
  CheckCheck,
  ClipboardList,
  FileText,
  ShieldCheck,
  Sparkles,
  TimerReset,
  Wand2
} from "lucide-react";

import { PlanLabBrand } from "@/components/branding/planlab-brand";
import { CountUp } from "@/components/landing/count-up";
import { ScrollReveal } from "@/components/landing/scroll-reveal";
import { SectionTitle } from "@/components/landing/section-title";
import { ThemeToggle } from "@/components/shared/theme-toggle";

const benefits = [
  {
    title: "Planeación estructurada",
    text: "Crea sesiones con objetivo, secuencia y evaluación clara en un solo flujo.",
    icon: ClipboardList
  },
  {
    title: "Ajuste inteligente del tiempo",
    text: "Distribuye cada bloque de clase para aprovechar mejor cada minuto.",
    icon: TimerReset
  },
  {
    title: "Asistencia y resultados",
    text: "Registra evidencias por estudiante y visualiza progreso de forma inmediata.",
    icon: CheckCheck
  },
  {
    title: "Alertas y reportes pedagógicos",
    text: "Detecta brechas a tiempo y genera reportes listos para compartir.",
    icon: BarChart3
  }
];

const flow = [
  { step: "01", label: "Crear plan", detail: "Define objetivo, estrategias y evaluación." },
  { step: "02", label: "Convertir en actividad", detail: "Lleva el plan a acciones concretas." },
  { step: "03", label: "Registrar resultados", detail: "Consolida asistencia, evidencias y logros." },
  { step: "04", label: "Analizar y reforzar", detail: "Aplica mejoras con foco en aprendizaje." }
];

const modules = [
  { name: "Planes", icon: ClipboardList },
  { name: "Actividades", icon: Wand2 },
  { name: "Resultados", icon: BarChart3 },
  { name: "Reportes", icon: FileText },
  { name: "Refuerzo pedagógico", icon: BrainCircuit }
];

const tech = [
  {
    title: "IA con Gemini",
    text: "Asistencia inteligente para proponer mejoras y enriquecer la planificación.",
    icon: Bot
  },
  {
    title: "Seguridad de datos",
    text: "Resguardo de información académica con enfoque en privacidad docente.",
    icon: ShieldCheck
  },
  {
    title: "Exportación PDF",
    text: "Genera reportes y documentos profesionales con formato claro.",
    icon: FileText
  },
  {
    title: "Experiencia web moderna",
    text: "Interfaz ágil, estable y pensada para equipos educativos actuales.",
    icon: Sparkles
  }
];

export default function LandingPage() {
  return (
    <main className="scroll-smooth bg-slate-100 text-slate-900 dark:bg-[#06070f] dark:text-slate-100">
      <div className="glow-orb glow-orb-top" />
      <div className="glow-orb glow-orb-bottom" />

      <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/75 backdrop-blur-md dark:border-white/10 dark:bg-[#070915]/75">
        <div className="mx-auto flex h-24 w-full max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="min-w-0 py-1">
              <PlanLabBrand kind="full" priority className="max-w-[172px]" />
              <p className="mt-2.5 pl-1 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Laboratorio pedagógico</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300 md:flex">
            <a href="#beneficios" className="transition hover:text-violet-500">Beneficios</a>
            <a href="#modulos" className="transition hover:text-violet-500">Módulos</a>
            <a href="#tecnologia" className="transition hover:text-violet-500">Tecnología</a>
          </nav>

          <ThemeToggle />
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-7xl gap-14 px-6 pb-28 pt-16 md:grid-cols-[1.03fr_0.97fr] md:items-center">
        <ScrollReveal>
          <p className="badge-float inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-violet-700 dark:text-violet-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400/80" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-400" />
            </span>
            Nueva generación de planificación docente
          </p>

          <h1 className="mt-7 text-5xl font-extrabold leading-[1.05] tracking-tight md:text-7xl">
            Tu laboratorio pedagógico <span className="gradient-text">inteligente</span>.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-slate-300">
            PlanLab conecta planeación, actividades, resultados y reportes en un flujo continuo para que el docente enseñe con más foco y menos fricción administrativa.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link href="/auth/register" className="rounded-2xl bg-gradient-to-r from-violet-500 via-indigo-500 to-blue-500 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-violet-900/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl">
              Crear cuenta
            </Link>
            <Link href="/auth/login" className="rounded-2xl border border-slate-300 bg-white px-8 py-4 text-sm font-bold transition hover:bg-slate-100 dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10">
              Iniciar sesión
            </Link>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className="glass-card-plus mockup-shell relative overflow-hidden rounded-[28px] p-6">
            <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-violet-500/35 blur-3xl" />
            <div className="absolute -bottom-20 -left-14 h-44 w-44 rounded-full bg-blue-500/25 blur-3xl" />

            <div className="relative space-y-4">
              <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-sm dark:border-white/10 dark:bg-[#0f1220]/70 dark:shadow-inner dark:shadow-violet-900/20">
                <div className="mb-3 flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
                  <span>Sesión activa</span>
                  <span>120 min</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Fracciones equivalentes · 5° Básico</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Plan con secuencia didáctica, actividades y evaluación formativa.</p>
                <div className="mt-4 space-y-2">
                  <div className="h-2 rounded-full bg-violet-500/20">
                    <div className="h-2 w-3/12 rounded-full bg-violet-400" />
                  </div>
                  <div className="h-2 rounded-full bg-blue-500/20">
                    <div className="h-2 w-9/12 rounded-full bg-blue-400" />
                  </div>
                  <div className="h-2 rounded-full bg-indigo-500/20">
                    <div className="h-2 w-6/12 rounded-full bg-indigo-400" />
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="metric-card rounded-2xl border border-slate-200/70 bg-white/95 p-4 dark:border-white/10 dark:bg-[#0f1220]/70">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Asistencia</p>
                  <p className="mt-2 text-2xl font-bold text-emerald-500 dark:text-emerald-300">
                    <CountUp to={95} suffix="%" />
                  </p>
                </div>
                <div className="metric-card rounded-2xl border border-slate-200/70 bg-white/95 p-4 dark:border-white/10 dark:bg-[#0f1220]/70">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Logro OA</p>
                  <p className="mt-2 text-2xl font-bold text-amber-500 dark:text-amber-300">
                    <CountUp to={84} suffix="%" />
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-violet-400/30 bg-violet-500/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-700 dark:text-violet-300">Sugerencia IA</p>
                <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">Refuerza con actividad breve de cierre para consolidar equivalencias en pares.</p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <section id="beneficios" className="mx-auto w-full max-w-7xl px-6 py-16">
        <ScrollReveal>
          <SectionTitle
            badge="Beneficios"
            title="Una plataforma diseñada para simplificar tu día docente"
            description="Más orden pedagógico, menos carga operativa y mejores decisiones en tiempo real."
          />
        </ScrollReveal>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {benefits.map((item) => (
            <ScrollReveal key={item.title}>
              <article className="glass-card-plus group rounded-2xl p-6">
                <item.icon className="h-5 w-5 text-violet-400 transition group-hover:scale-110" />
                <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.text}</p>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 py-16">
        <ScrollReveal>
          <SectionTitle
            badge="Cómo funciona"
            title="Un flujo visual simple para mejorar cada clase"
            description="Desde el plan inicial hasta el refuerzo pedagógico con seguimiento continuo."
          />
        </ScrollReveal>

        <div className="mt-10 grid gap-4 md:grid-cols-4">
          {flow.map((item) => (
            <ScrollReveal key={item.step}>
              <article className="glass-card-plus rounded-2xl p-6 text-center">
                <p className="mx-auto inline-flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/15 text-sm font-extrabold text-violet-700 dark:text-violet-300">
                  {item.step}
                </p>
                <h4 className="mt-4 font-bold">{item.label}</h4>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.detail}</p>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section id="modulos" className="mx-auto w-full max-w-7xl px-6 py-16">
        <ScrollReveal>
          <SectionTitle
            badge="Módulos"
            title="Cada módulo aporta valor directo al proceso pedagógico"
            description="Todo se conecta para darte una visión completa de tu curso."
          />
        </ScrollReveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {modules.map((module) => (
            <ScrollReveal key={module.name}>
              <article className="glass-card-plus rounded-2xl p-6 text-center">
                <module.icon className="mx-auto h-5 w-5 text-violet-500 dark:text-violet-300" />
                <h4 className="mt-4 text-sm font-semibold">{module.name}</h4>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section id="tecnologia" className="mx-auto w-full max-w-7xl px-6 py-16">
        <ScrollReveal>
          <SectionTitle
            badge="Tecnología"
            title="Innovación aplicada a la práctica docente"
            description="Tecnología potente detrás de una experiencia clara y usable para el aula."
          />
        </ScrollReveal>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {tech.map((item) => (
            <ScrollReveal key={item.title}>
              <article className="glass-card-plus rounded-2xl p-6">
                <item.icon className="h-5 w-5 text-violet-500 dark:text-violet-300" />
                <h3 className="mt-4 font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.text}</p>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-200/70 bg-white/80 px-6 py-12 dark:border-white/10 dark:bg-[#080a16]/80">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="relative h-9 w-9 shrink-0">
              <PlanLabBrand kind="icon" className="h-full w-full" />
            </div>
            <div>
              <p className="text-sm font-bold">PlanLab</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Planificación docente inteligente</p>
            </div>
          </div>

          <div className="flex items-center gap-5 text-sm text-slate-500 dark:text-slate-400">
            <a href="#beneficios" className="transition hover:text-violet-500">Beneficios</a>
            <a href="#modulos" className="transition hover:text-violet-500">Módulos</a>
            <a href="#tecnologia" className="transition hover:text-violet-500">Tecnología</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
