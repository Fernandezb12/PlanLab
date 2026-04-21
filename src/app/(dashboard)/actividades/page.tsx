import { ClipboardCheck, Eye, ListChecks } from "lucide-react";
import { redirect } from "next/navigation";

import { EmptyState } from "@/components/ui/empty-state";
import { Card } from "@/components/ui/card";
import { ModuleHeader } from "@/components/ui/module-header";
import { createClient } from "@/lib/supabase/server";

const statusStyles: Record<string, string> = {
  programada: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  "en curso": "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  "pendiente de registro": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  finalizada: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
};

export default async function ActividadesPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: activitiesData } = await supabase
    .from("activities")
    .select("id,title,status,due_date,lesson_plans(title)")
    .order("created_at", { ascending: false });

  return (
    <section className="space-y-6">
      <ModuleHeader title="Actividades" subtitle="Programa y monitorea actividades asociadas a cada plan." />

      {!activitiesData || activitiesData.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="Todavía no tienes actividades programadas"
          description="Programa una actividad desde un plan para empezar a registrar resultados."
          actionLabel="Programar actividad"
        />
      ) : (
        <div className="grid gap-3">
          {activitiesData.map((activity) => (
            <Card key={activity.id} className="glass-card-plus p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold tracking-tight">{activity.title}</h2>
                  {(() => {
                    const relatedPlan = Array.isArray(activity.lesson_plans) ? activity.lesson_plans[0] : activity.lesson_plans;
                    return (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Fecha: {activity.due_date ? new Date(activity.due_date).toLocaleDateString("es-CO") : "Sin fecha"} · Plan: {relatedPlan?.title ?? "Sin plan"}
                  </p>
                    );
                  })()}
                  <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[activity.status] ?? statusStyles.programada}`}>{activity.status}</span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <button className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-white/10">
                    <Eye className="h-4 w-4" />
                    Abrir detalle
                  </button>
                  <button className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 px-3 py-2 text-sm font-semibold text-white">
                    <ClipboardCheck className="h-4 w-4" />
                    Registrar resultados
                  </button>
                  <button className="rounded-lg border border-slate-300 p-2 dark:border-white/10">
                    <ListChecks className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
