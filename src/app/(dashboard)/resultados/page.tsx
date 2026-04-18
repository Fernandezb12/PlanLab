import { AlertTriangle, ChartColumn, CircleAlert, Users } from "lucide-react";

import { Card } from "@/components/ui/card";
import { pedagogicalAlerts, resultsPanels, resultsProgress } from "@/data/mock";

export default function ResultadosPage() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold">Resultados</h1>
        <p className="text-sm text-slate-500">Análisis pedagógico con indicadores claros para tomar decisiones a tiempo.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="glass-card-plus"><p className="text-sm text-slate-500">Promedio general</p><p className="mt-2 text-4xl font-bold">{resultsPanels.average}</p></Card>
        <Card className="glass-card-plus"><p className="text-sm text-slate-500">Asistencia promedio</p><p className="mt-2 text-4xl font-bold">{resultsPanels.attendance}</p></Card>
        <Card className="glass-card-plus"><p className="text-sm text-slate-500">Grupos con dificultad</p><p className="mt-2 text-2xl font-bold">{resultsPanels.difficultGroups.join(", ")}</p></Card>
        <Card className="glass-card-plus"><p className="text-sm text-slate-500">Estudiantes con alerta</p><p className="mt-2 text-2xl font-bold">{resultsPanels.studentsAlert.length}</p></Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="glass-card-plus">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold"><ChartColumn className="h-5 w-5 text-violet-500" /> Progreso por grupo</h2>
          <div className="space-y-3">
            {resultsProgress.map((group) => (
              <div key={group.group}>
                <div className="mb-1 flex justify-between text-sm"><span>{group.group}</span><span>{group.score}%</span></div>
                <div className="h-2 rounded-full bg-slate-200 dark:bg-white/10">
                  <div className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-blue-500" style={{ width: `${group.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="glass-card-plus">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold"><AlertTriangle className="h-5 w-5 text-amber-500" /> Alertas</h2>
          <div className="space-y-2">
            {pedagogicalAlerts.map((alert) => (
              <div key={alert.id} className="rounded-xl border border-amber-300/40 bg-amber-500/10 px-3 py-2 text-sm">{alert.text}</div>
            ))}
          </div>
          <div className="mt-5 rounded-xl border border-slate-200 bg-white/60 p-3 dark:border-white/10 dark:bg-white/5">
            <p className="flex items-center gap-2 text-sm"><Users className="h-4 w-4 text-blue-500" /> Recomendación: reforzar 5A y 7B con actividades escalonadas.</p>
            <p className="mt-2 flex items-center gap-2 text-sm"><CircleAlert className="h-4 w-4 text-violet-500" /> Prioriza estudiantes con inasistencia superior al 15%.</p>
          </div>
        </Card>
      </div>
    </section>
  );
}
