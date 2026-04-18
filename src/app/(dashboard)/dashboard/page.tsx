import Link from "next/link";
import { AlertTriangle, ArrowRight, Clock3, Sparkles } from "lucide-react";

import { Card } from "@/components/ui/card";
import { dashboardStats, pedagogicalAlerts, quickActions, recentActivity } from "@/data/mock";

const toneClasses: Record<string, string> = {
  violet: "text-violet-500",
  blue: "text-blue-500",
  indigo: "text-indigo-500",
  amber: "text-amber-500"
};

export default function DashboardHomePage() {
  return (
    <section className="space-y-6">
      <Card className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white dark:from-slate-950 dark:to-slate-900">
        <h1 className="text-4xl font-extrabold tracking-tight">¡Hola, Daniel! Bienvenido a tu laboratorio pedagógico.</h1>
        <p className="mt-2 text-slate-300">Tienes 2 actividades hoy, y 1 grupo con alerta de seguimiento.</p>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((kpi) => (
          <Card key={kpi.id} className="glass-card-plus">
            <p className="text-sm text-slate-500 dark:text-slate-400">{kpi.title}</p>
            <p className="mt-3 text-5xl font-bold">{kpi.value}</p>
            <p className={`mt-2 text-sm font-semibold ${toneClasses[kpi.tone]}`}>{kpi.delta}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {quickActions.map((action) => (
          <Link key={action.id} href={action.href} className={`rounded-2xl bg-gradient-to-r ${action.color} px-5 py-5 text-white shadow-lg transition hover:-translate-y-0.5`}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-lg font-bold">{action.title}</p>
              <Sparkles className="h-5 w-5" />
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="glass-card-plus">
          <h2 className="text-2xl font-bold">Actividad reciente</h2>
          <div className="mt-4 space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white/70 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                <p className="text-sm">{activity.text}</p>
                <p className="text-xs text-slate-500">{activity.time}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="glass-card-plus">
          <h2 className="text-2xl font-bold">Alertas pedagógicas</h2>
          <div className="mt-4 space-y-3">
            {pedagogicalAlerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <p className="text-sm">{alert.text}</p>
                </div>
                <Clock3 className="h-4 w-4 text-slate-500" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Link href="/planes" className="inline-flex items-center gap-2 text-sm font-semibold text-violet-600 hover:text-violet-500">
        Ir al módulo de planes
        <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  );
}
