import { Plus, UserPlus } from "lucide-react";
import { redirect } from "next/navigation";

import { EmptyState } from "@/components/ui/empty-state";
import { Card } from "@/components/ui/card";
import { ModuleHeader } from "@/components/ui/module-header";
import { createClient } from "@/lib/supabase/server";

const studentStatusStyles: Record<string, string> = {
  activo: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  seguimiento: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
};

export default async function GruposPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const [{ data: groupsData }, { data: studentsByGroup }] = await Promise.all([
    supabase.from("groups").select("id,name,level,area").order("created_at", { ascending: false }),
    supabase.from("students").select("id,full_name,code,status,note,group_id,groups(name)").order("created_at", { ascending: false })
  ]);

  return (
    <section className="space-y-6">
      <ModuleHeader
        title="Grupos y Estudiantes"
        subtitle="Administra grupos, estudiantes y su estado académico."
        actions={
          <>
            <button className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-white/10"><Plus className="h-4 w-4" />Crear grupo</button>
            <button className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 px-3 py-2 text-sm font-semibold text-white"><UserPlus className="h-4 w-4" />Agregar estudiante</button>
          </>
        }
      />

      {!groupsData || groupsData.length === 0 ? (
        <EmptyState icon={Plus} title="Aún no has agregado grupos" description="Crea tu primer grupo para comenzar a organizar cursos y estudiantes." actionLabel="Crear grupo" />
      ) : (
        <Card className="glass-card-plus overflow-x-auto p-4">
          <table className="w-full min-w-[620px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10">
                <th className="py-2.5 text-left">Grupo</th><th className="text-left">Nivel</th><th className="text-left">Área</th><th className="text-left">Estudiantes</th>
              </tr>
            </thead>
            <tbody>
              {groupsData.map((group) => (
                <tr key={group.id} className="border-b border-slate-100 transition hover:bg-slate-50/80 dark:border-white/5 dark:hover:bg-white/[0.03]">
                  <td className="py-2.5 font-semibold tracking-tight">{group.name}</td>
                  <td>{group.level ?? "Sin nivel"}</td>
                  <td>{group.area ?? "General"}</td>
                  <td>{studentsByGroup?.filter((student) => student.group_id === group.id).length ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {!studentsByGroup || studentsByGroup.length === 0 ? (
        <EmptyState
          icon={UserPlus}
          title="No se encontraron estudiantes"
          description="Agrega estudiantes a tus grupos para monitorear su progreso desde el panel."
          actionLabel="Agregar estudiante"
        />
      ) : (
        <Card className="glass-card-plus overflow-x-auto p-4">
          <h2 className="mb-3 text-xl font-bold tracking-tight">Estudiantes</h2>
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10">
                <th className="py-2.5 text-left">Nombre</th><th className="text-left">Código</th><th className="text-left">Grupo</th><th className="text-left">Estado</th><th className="text-left">Observación</th>
              </tr>
            </thead>
            <tbody>
              {studentsByGroup.map((student) => (
                <tr key={student.id} className="border-b border-slate-100 transition hover:bg-slate-50/80 dark:border-white/5 dark:hover:bg-white/[0.03]">
                  {(() => {
                    const relatedGroup = Array.isArray(student.groups) ? student.groups[0] : student.groups;
                    return (
                      <>
                  <td className="py-2.5 font-semibold tracking-tight">{student.full_name}</td>
                  <td className="font-medium text-slate-600 dark:text-slate-300">{student.code ?? "—"}</td>
                  <td>{relatedGroup?.name ?? "Sin grupo"}</td>
                  <td>
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${studentStatusStyles[student.status] ?? "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"}`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="text-slate-600 dark:text-slate-300">{student.note ?? "Sin observaciones"}</td>
                      </>
                    );
                  })()}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </section>
  );
}
