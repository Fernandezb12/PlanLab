import { Eye, FileDown } from "lucide-react";

import { Card } from "@/components/ui/card";
import { reportsData } from "@/data/mock";

export default function ReportesPage() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold">Reportes</h1>
        <p className="text-sm text-slate-500">Consulta reportes generados y exporta versiones PDF en un clic.</p>
      </div>

      <div className="grid gap-4">
        {reportsData.map((report) => (
          <Card key={report.id} className="glass-card-plus">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">{report.title}</h2>
                <p className="text-sm text-slate-500">{report.type} · Grupo {report.group} · {report.date}</p>
              </div>

              <div className="flex gap-2">
                <button className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm dark:border-white/10">
                  <Eye className="h-4 w-4" />
                  Visualizar
                </button>
                <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white">
                  <FileDown className="h-4 w-4" />
                  Exportar PDF
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
