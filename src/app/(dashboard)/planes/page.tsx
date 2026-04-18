import { Copy, Eye, FileDown, Pencil, PlusCircle, Sparkles } from "lucide-react";

import { Card } from "@/components/ui/card";
import { plansData } from "@/data/mock";

const statusStyles: Record<string, string> = {
  borrador: "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  generado: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  listo: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  archivado: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
};

export default function PlanesPage() {
  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">Módulo de Planes</h1>
          <p className="text-sm text-slate-500">Diseña, organiza y convierte tus planes en actividades listas para el aula.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 px-5 py-3 font-semibold text-white shadow-lg shadow-violet-900/30">
          <PlusCircle className="h-4 w-4" />
          Crear nuevo plan
        </button>
      </div>

      <Card className="glass-card-plus">
        <div className="grid gap-3 md:grid-cols-5">
          <input placeholder="Buscar plan..." className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5" />
          <select className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5"><option>Grupo</option></select>
          <select className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5"><option>Área</option></select>
          <select className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5"><option>Estado</option></select>
          <input type="date" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5" />
        </div>
      </Card>

      <div className="grid gap-4">
        {plansData.map((plan) => (
          <Card key={plan.id} className="glass-card-plus">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-xl font-bold">{plan.topic}</h2>
                <p className="text-sm text-slate-500">{plan.group} · {plan.area} · {plan.duration} · {plan.date}</p>
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[plan.status]}`}>{plan.status}</span>
              </div>

              <div className="flex flex-wrap gap-2">
                <button className="rounded-lg border border-slate-300 p-2 hover:bg-slate-100 dark:border-white/10 dark:hover:bg-white/10"><Eye className="h-4 w-4" /></button>
                <button className="rounded-lg border border-slate-300 p-2 hover:bg-slate-100 dark:border-white/10 dark:hover:bg-white/10"><Pencil className="h-4 w-4" /></button>
                <button className="rounded-lg border border-slate-300 p-2 hover:bg-slate-100 dark:border-white/10 dark:hover:bg-white/10"><Copy className="h-4 w-4" /></button>
                <button className="rounded-lg border border-violet-400/40 bg-violet-500/10 px-3 py-2 text-sm font-medium text-violet-700 dark:text-violet-300">
                  <span className="inline-flex items-center gap-1"><Sparkles className="h-4 w-4" />Convertir en actividad</span>
                </button>
                <button className="rounded-lg border border-slate-300 p-2 hover:bg-slate-100 dark:border-white/10 dark:hover:bg-white/10"><FileDown className="h-4 w-4" /></button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
