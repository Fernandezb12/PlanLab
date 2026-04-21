import Link from "next/link";
import { AlertTriangle, ArrowRight, Clock3, Sparkles } from "lucide-react";
import { redirect } from "next/navigation";

import { EmptyState } from "@/components/ui/empty-state";
import { Card } from "@/components/ui/card";
import { ModuleHeader } from "@/components/ui/module-header";
import { quickActions } from "@/data/mock";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardHomePage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  const [plansCount, activitiesCount, groupsCount, reportsCount] = await Promise.all([
    supabase.from("lesson_plans").select("id", { count: "exact", head: true }),
    supabase.from("activities").select("id", { count: "exact", head: true }),
    supabase.from("groups").select("id", { count: "exact", head: true }),
    supabase.from("reports").select("id", { count: "exact", head: true })
  ]);

  const dashboardStats = [
    { id: "kpi-1", title: "Planes creados", value: String(plansCount.count ?? 0), delta: "Registros reales", toneClass: "text-violet-500" },
    { id: "kpi-2", title: "Actividades programadas", value: String(activitiesCount.count ?? 0), delta: "Registros reales", toneClass: "text-blue-500" },
    { id: "kpi-3", title: "Grupos activos", value: String(groupsCount.count ?? 0), delta: "Registros reales", toneClass: "text-indigo-500" },
    { id: "kpi-4", title: "Reportes generados", value: String(reportsCount.count ?? 0), delta: "Registros reales", toneClass: "text-amber-500" }
  ];

  const recentActivity: { id: string; text: string; time: string }[] = [];
  const pedagogicalAlerts: { id: string; text: string }[] = [];
  const primaryAction = quickActions[0];
  const secondaryActions = quickActions.slice(1);

  return (
    <section className="space-y-6">
      <ModuleHeader
        title="Dashboard"
        subtitle="Monitorea tus indicadores clave y accede rápido a tus flujos de trabajo."
      />

      <Card className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white dark:from-slate-950 dark:to-slate-900">
        <h1 className="text-4xl font-extrabold tracking-tight">¡Hola, {profile?.full_name ?? (user.user_metadata?.full_name as string | undefined) ?? "docente"}!</h1>
        <p className="mt-2 text-slate-300">Tu panel ya está conectado a sesión real. Si aún no ves datos, empieza creando tus primeros registros.</p>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((kpi) => (
          <Card key={kpi.id} className="glass-card-plus p-5">
            <p className="text-sm text-slate-500 dark:text-slate-400">{kpi.title}</p>
            <p className="mt-2 text-4xl font-bold tracking-tight">{kpi.value}</p>
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
            className="flex min-h-[66px] items-center justify-between rounded-xl border border-slate-300/80 bg-white/70 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-violet-300 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
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
            // Yo muestro un vacío elegante para mantener consistencia cuando no hay datos.
            <div className="mt-4">
              <EmptyState icon={Clock3} title="No hay actividad reciente" description="Tus últimas acciones aparecerán aquí para darte contexto rápido." />
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white/70 px-3 py-2.5 dark:border-white/10 dark:bg-white/5">
                  <p className="text-sm">{activity.text}</p>
                  <p className="text-xs text-slate-500">{activity.time}</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="glass-card-plus p-5">
          <h2 className="text-xl font-bold tracking-tight">Alertas pedagógicas</h2>
          {pedagogicalAlerts.length === 0 ? (
            <div className="mt-4">
              <EmptyState icon={AlertTriangle} title="No hay alertas activas por ahora" description="Cuando surjan alertas pedagógicas, las verás en este panel." />
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {pedagogicalAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between rounded-xl border border-amber-400/40 bg-amber-500/10 px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <p className="text-sm">{alert.text}</p>
                  </div>
                  <Clock3 className="h-4 w-4 text-slate-500" />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Link href="/planes" className="inline-flex items-center gap-2 text-sm font-semibold text-violet-600 hover:text-violet-500">
        Ir al módulo de planes
        <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  );
}
