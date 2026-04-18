import { ClipboardCheck, Eye, ListChecks } from "lucide-react";

import { Card } from "@/components/ui/card";
import { activitiesData } from "@/data/mock";

const statusStyles: Record<string, string> = {
  programada: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  "en curso": "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  "pendiente de registro": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  finalizada: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
};

export default function ActividadesPage() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold">Actividades</h1>
        <p className="text-sm text-slate-500">Programa y monitorea actividades asociadas a cada plan.</p>
      </div>

      <div className="grid gap-4">
        {activitiesData.map((activity) => (
          <Card key={activity.id} className="glass-card-plus">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">{activity.title}</h2>
                <p className="text-sm text-slate-500">Grupo {activity.group} · {activity.date} · Plan: {activity.relatedPlan}</p>
                <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[activity.status]}`}>{activity.status}</span>
              </div>

              <div className="flex gap-2">
                <button className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm dark:border-white/10">
                  <Eye className="h-4 w-4" />
                  Abrir detalle
                </button>
                <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white">
                  <ClipboardCheck className="h-4 w-4" />
                  Registrar resultados
                </button>
                <button className="rounded-xl border border-slate-300 p-2 dark:border-white/10">
                  <ListChecks className="h-4 w-4" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
