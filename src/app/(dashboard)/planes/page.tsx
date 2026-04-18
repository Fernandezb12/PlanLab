import { Copy, Eye, FileDown, Pencil, PlusCircle, Sparkles } from "lucide-react";
import { redirect } from "next/navigation";

import { EmptyState } from "@/components/ui/empty-state";
import { Card } from "@/components/ui/card";
import { ModuleHeader } from "@/components/ui/module-header";
import { createClient } from "@/lib/supabase/server";

const statusStyles: Record<string, string> = {
  borrador: "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  generado: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  listo: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  archivado: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
};

export default async function PlanesPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: plansData } = await supabase
    .from("lesson_plans")
    .select("id,title,status,created_at,groups(name,level)")
    .order("created_at", { ascending: false });

  return (
    <section className="space-y-6">
      <ModuleHeader
        title="Módulo de Planes"
        subtitle="Diseña, organiza y convierte tus planes en actividades listas para el aula."
        actions={
          <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/30">
            <PlusCircle className="h-4 w-4" />
            Crear nuevo plan
          </button>
        }
      />

      <Card className="glass-card-plus p-4">
        <div className="grid gap-3 md:grid-cols-5">
          <input placeholder="Buscar plan..." className="rounded-lg border border-slate-300/80 bg-white/90 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/[0.03]" />
          <select className="rounded-lg border border-slate-300/80 bg-white/90 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/[0.03]"><option>Grupo</option></select>
          <select className="rounded-lg border border-slate-300/80 bg-white/90 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/[0.03]"><option>Área</option></select>
          <select className="rounded-lg border border-slate-300/80 bg-white/90 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/[0.03]"><option>Estado</option></select>
          <input type="date" className="rounded-lg border border-slate-300/80 bg-white/90 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/[0.03]" />
        </div>
      </Card>

      {!plansData || plansData.length === 0 ? (
        <EmptyState icon={Sparkles} title="Aún no has creado planes" description="Comienza con tu primer plan y conviértelo en actividades en minutos." actionLabel="Crear primer plan" />
      ) : (
        <div className="grid gap-3">
          {plansData.map((plan) => (
            <Card key={plan.id} className="glass-card-plus p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  {/*
                    Yo normalizo relación anidada porque Supabase puede devolver objeto o arreglo según tipado generado.
                  */}
                  {(() => {
                    const relatedGroup = Array.isArray(plan.groups) ? plan.groups[0] : plan.groups;
                    return (
                      <>
                  <h2 className="text-lg font-bold tracking-tight">{plan.title}</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {relatedGroup?.name ?? "Sin grupo"} · {relatedGroup?.level ?? "Sin nivel"} · {new Date(plan.created_at).toLocaleDateString("es-CO")}
                  </p>
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[plan.status] ?? statusStyles.borrador}`}>{plan.status}</span>
                      </>
                    );
                  })()}
                </div>

                <div className="flex flex-wrap items-center justify-end gap-1.5">
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
      )}
    </section>
  );
}
