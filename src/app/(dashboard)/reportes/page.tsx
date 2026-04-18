import { Eye, FileDown } from "lucide-react";
import { redirect } from "next/navigation";

import { EmptyState } from "@/components/ui/empty-state";
import { Card } from "@/components/ui/card";
import { ModuleHeader } from "@/components/ui/module-header";
import { createClient } from "@/lib/supabase/server";

export default async function ReportesPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: reportsData } = await supabase
    .from("reports")
    .select("id,title,type,created_at,groups(name)")
    .order("created_at", { ascending: false });

  return (
    <section className="space-y-6">
      <ModuleHeader title="Reportes" subtitle="Consulta reportes generados y exporta versiones PDF en un clic." />

      {!reportsData || reportsData.length === 0 ? (
        <EmptyState
          icon={FileDown}
          title="No hay reportes generados"
          description="Cuando exportes resultados desde tus grupos, aparecerán aquí para consulta rápida."
          actionLabel="Generar primer reporte"
        />
      ) : (
        <div className="grid gap-3">
          {reportsData.map((report) => (
            <Card key={report.id} className="glass-card-plus p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold tracking-tight">{report.title}</h2>
                  {(() => {
                    const relatedGroup = Array.isArray(report.groups) ? report.groups[0] : report.groups;
                    return (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {report.type ?? "General"} · Grupo {relatedGroup?.name ?? "Sin grupo"} · {new Date(report.created_at).toLocaleDateString("es-CO")}
                  </p>
                    );
                  })()}
                </div>

                <div className="flex gap-1.5">
                  <button className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-white/10">
                    <Eye className="h-4 w-4" />
                    Visualizar
                  </button>
                  <button className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 to-indigo-500 px-3 py-2 text-sm font-semibold text-white">
                    <FileDown className="h-4 w-4" />
                    Exportar PDF
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
