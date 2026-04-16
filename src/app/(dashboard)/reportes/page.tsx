import { Card } from "@/components/ui/card";
import { reports } from "@/data/mock";

export default function ReportesPage() {
  return (
    <section>
      <h1 className="mb-6 text-2xl font-bold">Reportes</h1>
      <div className="space-y-4">
        {reports.map((report) => (
          <Card key={report.id} className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">{report.title}</h2>
              <p className="text-sm text-slate-500">Generado: {report.generatedAt}</p>
            </div>
            <button type="button" className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800">
              Exportar PDF
            </button>
          </Card>
        ))}
      </div>
    </section>
  );
}
