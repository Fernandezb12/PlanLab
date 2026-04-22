import Link from "next/link";
import { AlertTriangle, ArrowRight, Clock3, FileDown, Sparkles } from "lucide-react";

import { AnimatedNumber } from "@/components/ui/animated-number";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ModuleHeader } from "@/components/ui/module-header";

type DashboardKpi = {
  id: string;
  title: string;
  value: string;
  numericValue?: number | null;
  decimals?: number;
  suffix?: string;
  delta: string;
  toneClass: string;
};

type QuickAction = {
  id: string;
  title: string;
  href: string;
  color: string;
};

type RecentActivityItem = {
  id: string;
  text: string;
  time: string;
};

type AlertItem = {
  id: string;
  text: string;
};

type DashboardPanelProps = {
  teacherName: string;
  kpis: DashboardKpi[];
  quickActions: QuickAction[];
  recentActivity: RecentActivityItem[];
  alerts: AlertItem[];
};

export const DashboardPanel = ({ teacherName, kpis, quickActions, recentActivity, alerts }: DashboardPanelProps) => {
  const primaryAction = quickActions[0];
  const secondaryActions = quickActions.slice(1);

  return (
    <section className="space-y-6">
      <ModuleHeader title="Dashboard" subtitle="Consulta tus indicadores principales y accede rápidamente a las acciones clave." />

      <Card className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white dark:from-slate-950 dark:to-slate-900">
        <h1 className="text-4xl font-extrabold tracking-tight">¡Hola, {teacherName}!</h1>
        <p className="mt-2 text-slate-300">Este tablero reúne información de planes, actividades, resultados y reportes en un solo lugar.</p>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.id} className="glass-card-plus p-5 transition duration-300 hover:-translate-y-0.5">
            <p className="text-sm text-slate-500 dark:text-slate-400">{kpi.title}</p>
            <p className="mt-2 text-4xl font-bold tracking-tight">
              {typeof kpi.numericValue === "number" ? (
                <AnimatedNumber value={kpi.numericValue} decimals={kpi.decimals ?? 0} suffix={kpi.suffix ?? ""} />
              ) : (
                kpi.value
              )}
            </p>
            <p className={`mt-2 text-sm font-semibold ${kpi.toneClass}`}>{kpi.delta}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <Link
          href={primaryAction.href}
          className={`group flex min-h-[66px] items-center justify-between rounded-xl bg-gradient-to-r ${primaryAction.color} px-4 py-3 text-white shadow-md shadow-violet-900/25 transition hover:-translate-y-0.5`}
        >
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-violet-100/75">Principal</p>
            <p className="mt-1 text-sm font-semibold tracking-tight">{primaryAction.title}</p>
          </div>
          <Sparkles className="h-4 w-4 text-violet-100/90 transition group-hover:rotate-6" />
        </Link>

        {secondaryActions.map((action) => (
          <Link
            key={action.id}
            href={action.href}
            className="flex min-h-[66px] items-center justify-between rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-300 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
          >
            <span className="tracking-tight">{action.title}</span>
            <ArrowRight className="h-4 w-4 text-slate-400 dark:text-slate-500" />
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="glass-card-plus p-5">
          <h2 className="text-xl font-bold tracking-tight">Actividad reciente</h2>
          {recentActivity.length === 0 ? (
            <div className="mt-4">
              <EmptyState icon={Clock3} title="Aún no hay actividad reciente" description="Crea grupos, planes y actividades para comenzar a ver movimiento en este espacio." />
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm dark:border-white/10 dark:bg-white/5">
                  <p className="text-sm">{activity.text}</p>
                  <p className="text-xs text-slate-500">{activity.time}</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="glass-card-plus p-5">
          <h2 className="text-xl font-bold tracking-tight">Alertas pedagógicas</h2>
          {alerts.length === 0 ? (
            <div className="mt-4">
              <EmptyState icon={AlertTriangle} title="No hay alertas activas por ahora" description="Las alertas aparecerán aquí cuando el sistema detecte señales relevantes." />
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 dark:border-amber-400/40 dark:bg-amber-500/10">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <p className="text-sm text-amber-900 dark:text-slate-100">{alert.text}</p>
                  </div>
                  <Clock3 className="h-4 w-4 text-slate-500" />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Link href="/reportes" className="inline-flex items-center gap-2 text-sm font-semibold text-violet-600 hover:text-violet-500">
        Ir al módulo de reportes
        <FileDown className="h-4 w-4" />
      </Link>
    </section>
  );
};
