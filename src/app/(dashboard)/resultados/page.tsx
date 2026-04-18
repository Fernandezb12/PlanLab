import { AlertTriangle, ChartColumn, CircleAlert, Users } from "lucide-react";
import { redirect } from "next/navigation";

import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ModuleHeader } from "@/components/ui/module-header";
import { createClient } from "@/lib/supabase/server";

export default async function ResultadosPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const [groupsCount, studentsCount, activitiesCount] = await Promise.all([
    supabase.from("groups").select("id", { count: "exact", head: true }),
    supabase.from("students").select("id", { count: "exact", head: true }),
    supabase.from("activities").select("id", { count: "exact", head: true })
  ]);

  const pedagogicalAlerts: { id: string; text: string }[] = [];

  return (
    <section className="space-y-6">
      <ModuleHeader title="Resultados" subtitle="Análisis pedagógico con indicadores claros para tomar decisiones a tiempo." />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="glass-card-plus p-5"><p className="text-sm text-slate-500 dark:text-slate-400">Grupos evaluables</p><p className="mt-2 text-4xl font-bold tracking-tight">{groupsCount.count ?? 0}</p></Card>
        <Card className="glass-card-plus p-5"><p className="text-sm text-slate-500 dark:text-slate-400">Estudiantes registrados</p><p className="mt-2 text-4xl font-bold tracking-tight">{studentsCount.count ?? 0}</p></Card>
        <Card className="glass-card-plus p-5"><p className="text-sm text-slate-500 dark:text-slate-400">Actividades con seguimiento</p><p className="mt-2 text-2xl font-bold tracking-tight">{activitiesCount.count ?? 0}</p></Card>
        <Card className="glass-card-plus p-5"><p className="text-sm text-slate-500 dark:text-slate-400">Alertas activas</p><p className="mt-2 text-2xl font-bold tracking-tight">{pedagogicalAlerts.length}</p></Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="glass-card-plus p-5">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold tracking-tight"><ChartColumn className="h-5 w-5 text-violet-500" /> Progreso por grupo</h2>
          <EmptyState icon={ChartColumn} title="Aún no hay resultados consolidados" description="Cuando registres resultados de actividades, verás aquí la evolución por grupo." />
        </Card>

        <Card className="glass-card-plus p-5">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold tracking-tight"><AlertTriangle className="h-5 w-5 text-amber-500" /> Alertas</h2>
          {pedagogicalAlerts.length === 0 ? (
            <EmptyState icon={AlertTriangle} title="No hay alertas activas por ahora" description="Cuando detectemos riesgos pedagógicos, aparecerán en este bloque." />
          ) : (
            <>
              <div className="space-y-2">
                {pedagogicalAlerts.map((alert) => (
                  <div key={alert.id} className="rounded-xl border border-amber-300/40 bg-amber-500/10 px-3 py-2 text-sm">{alert.text}</div>
                ))}
              </div>
              <div className="mt-5 rounded-xl border border-slate-200 bg-white/60 p-3 dark:border-white/10 dark:bg-white/5">
                <p className="flex items-center gap-2 text-sm"><Users className="h-4 w-4 text-blue-500" /> Recomendación: reforzar grupos con menor avance.</p>
                <p className="mt-2 flex items-center gap-2 text-sm"><CircleAlert className="h-4 w-4 text-violet-500" /> Prioriza estudiantes con baja participación.</p>
              </div>
            </>
          )}
        </Card>
      </div>
    </section>
  );
}
