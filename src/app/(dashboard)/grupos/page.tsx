import { Plus, UserPlus } from "lucide-react";

import { Card } from "@/components/ui/card";
import { groupsData, studentsByGroup } from "@/data/mock";

export default function GruposPage() {
  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold">Grupos y Estudiantes</h1>
          <p className="text-sm text-slate-500">Administra grupos, estudiantes y su estado académico.</p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm dark:border-white/10"><Plus className="h-4 w-4" />Crear grupo</button>
          <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white"><UserPlus className="h-4 w-4" />Agregar estudiante</button>
        </div>
      </div>

      <Card className="glass-card-plus overflow-x-auto">
        <table className="w-full min-w-[620px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-white/10">
              <th className="py-3 text-left">Grupo</th><th className="text-left">Nivel</th><th className="text-left">Área</th><th className="text-left">Estudiantes</th>
            </tr>
          </thead>
          <tbody>
            {groupsData.map((group) => (
              <tr key={group.id} className="border-b border-slate-100 dark:border-white/5">
                <td className="py-3 font-semibold">{group.name}</td><td>{group.level}</td><td>{group.area}</td><td>{group.students}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card className="glass-card-plus overflow-x-auto">
        <h2 className="mb-4 text-xl font-bold">Estudiantes</h2>
        <table className="w-full min-w-[700px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-white/10">
              <th className="py-3 text-left">Nombre</th><th className="text-left">Código</th><th className="text-left">Grupo</th><th className="text-left">Estado</th><th className="text-left">Observación</th>
            </tr>
          </thead>
          <tbody>
            {studentsByGroup.map((student) => (
              <tr key={student.id} className="border-b border-slate-100 dark:border-white/5">
                <td className="py-3 font-semibold">{student.name}</td><td>{student.code}</td><td>{student.group}</td><td>{student.status}</td><td>{student.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </section>
  );
}
