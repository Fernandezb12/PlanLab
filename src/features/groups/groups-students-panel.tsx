"use client";

import { FileUp, Pencil, Plus, Trash2, UserPlus, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { EmptyState } from "@/components/ui/empty-state";
import { Card } from "@/components/ui/card";
import { ModuleHeader } from "@/components/ui/module-header";

import {
  createGroupAction,
  createStudentAction,
  deleteGroupAction,
  deleteStudentAction,
  type ActionResult,
  updateGroupAction,
  updateStudentAction
} from "./actions";
import { GroupFormDialog } from "./group-form-dialog";
import { ImportStudentsDialog } from "./import-students-dialog";
import { StudentFormDialog } from "./student-form-dialog";

type GroupRecord = {
  id: string;
  name: string;
  level: string | null;
  subject: string | null;
  period: string | null;
  studentCount: number;
};

type StudentRecord = {
  id: string;
  full_name: string;
  student_code: string | null;
  status: string;
  notes: string | null;
  group_id: string | null;
  groups: { id: string; name: string } | { id: string; name: string }[] | null;
};

type FeedbackState = {
  tone: "success" | "error";
  message: string;
} | null;

const studentStatusStyles: Record<string, string> = {
  activo: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  seguimiento: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  inactivo: "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
};

type GroupsStudentsPanelProps = {
  groups: GroupRecord[];
  students: StudentRecord[];
};

export const GroupsStudentsPanel = ({ groups, students }: GroupsStudentsPanelProps) => {
  const router = useRouter();
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<GroupRecord | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();

  const groupOptions = useMemo(() => groups.map((group) => ({ id: group.id, name: group.name })), [groups]);

  const openCreateGroup = () => {
    setSelectedGroup(null);
    setGroupModalOpen(true);
  };

  const openEditGroup = (group: GroupRecord) => {
    setSelectedGroup(group);
    setGroupModalOpen(true);
  };

  const openCreateStudent = () => {
    setSelectedStudent(null);
    setStudentModalOpen(true);
  };

  const openEditStudent = (student: StudentRecord) => {
    setSelectedStudent(student);
    setStudentModalOpen(true);
  };

  const handleCompleted = (result: ActionResult) => {
    const summaryText =
      result.summary && result.success
        ? ` Insertados: ${result.summary.inserted}. Omitidos por duplicado: ${result.summary.omittedDuplicates}.`
        : "";

    setFeedback({
      tone: result.success ? "success" : "error",
      message: `${result.message}${summaryText}`
    });

    if (result.success) {
      setGroupModalOpen(false);
      setStudentModalOpen(false);
      setImportModalOpen(false);
      setSelectedGroup(null);
      setSelectedStudent(null);
      router.refresh();
    }
  };

  const handleDeleteGroup = (group: GroupRecord) => {
    if (!window.confirm(`Se eliminará el grupo "${group.name}". Los estudiantes quedarán sin grupo asignado. ¿Quieres continuar?`)) {
      return;
    }

    startDeleteTransition(async () => {
      const result = await deleteGroupAction(group.id);
      handleCompleted(result);
    });
  };

  const handleDeleteStudent = (student: StudentRecord) => {
    if (!window.confirm(`Se eliminará el estudiante "${student.full_name}". ¿Quieres continuar?`)) {
      return;
    }

    startDeleteTransition(async () => {
      const result = await deleteStudentAction(student.id);
      handleCompleted(result);
    });
  };

  return (
    <section className="space-y-6">
      <ModuleHeader
        title="Grupos y Estudiantes"
        subtitle="Administra grupos, estudiantes y su estado académico."
        actions={
          <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
            <button
              type="button"
              onClick={() => setImportModalOpen(true)}
              disabled={groups.length === 0}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.24)] transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100 dark:hover:bg-white/10 sm:w-auto sm:px-4 sm:py-2.5 sm:text-[0.95rem]"
            >
              <FileUp className="h-4 w-4" />
              Importar estudiantes
            </button>
            <button
              type="button"
              onClick={openCreateGroup}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.2)] transition hover:border-slate-400 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100 dark:hover:bg-white/10 sm:w-auto sm:px-4 sm:py-2.5 sm:text-[0.95rem]"
            >
              <Plus className="h-4 w-4" />
              Crear grupo
            </button>
            <button
              type="button"
              onClick={openCreateStudent}
              disabled={groups.length === 0}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-4 sm:py-2.5 sm:text-[0.95rem]"
            >
              <UserPlus className="h-4 w-4" />
              Agregar estudiante
            </button>
          </div>
        }
      />

      {feedback ? (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            feedback.tone === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
              : "border-rose-500/30 bg-rose-500/10 text-rose-200"
          }`}
        >
          {feedback.message}
        </div>
      ) : null}

      {!groups.length ? (
        <EmptyState
          icon={Plus}
          title="Aún no has agregado grupos"
          description="Crea tu primer grupo para comenzar a organizar cursos y estudiantes."
          action={
            <button
              type="button"
              onClick={openCreateGroup}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 dark:border-white/15 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/10"
            >
              Crear grupo
            </button>
          }
        />
      ) : (
        <Card className="glass-card-plus p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Grupos</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Cada grupo está disponible únicamente dentro de tu cuenta docente.</p>
            </div>
            <div className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-violet-300">
              {groups.length} registrados
            </div>
          </div>

          <div className="space-y-3 md:hidden">
            {groups.map((group) => (
              <div key={group.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-50">{group.name}</p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                      {group.level ?? "Sin nivel"} · {group.subject ?? "General"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{group.period ?? "Sin período"}</p>
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-900/5 px-2.5 py-1 text-xs font-semibold dark:bg-white/10">
                    <Users className="h-3.5 w-3.5" />
                    {group.studentCount}
                  </span>
                </div>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => openEditGroup(group)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100 dark:hover:bg-white/10 sm:px-4 sm:py-2.5 sm:text-sm"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteGroup(group)}
                    disabled={isDeleting}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-500/25 dark:bg-transparent dark:text-rose-300 dark:hover:bg-rose-500/10 sm:px-4 sm:py-2.5 sm:text-sm"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10">
                  <th className="py-2.5 text-left">Grupo</th>
                  <th className="text-left">Nivel</th>
                  <th className="text-left">Área o asignatura</th>
                  <th className="text-left">Período</th>
                  <th className="text-left">Estudiantes</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((group) => (
                  <tr key={group.id} className="border-b border-slate-100 transition hover:bg-slate-50/80 dark:border-white/5 dark:hover:bg-white/[0.03]">
                    <td className="py-3 font-semibold tracking-tight">{group.name}</td>
                    <td>{group.level ?? "Sin nivel"}</td>
                    <td>{group.subject ?? "General"}</td>
                    <td>{group.period ?? "Sin período"}</td>
                    <td>
                      <span className="inline-flex items-center gap-2 rounded-full bg-slate-900/5 px-2.5 py-1 text-xs font-semibold dark:bg-white/10">
                        <Users className="h-3.5 w-3.5" />
                        {group.studentCount}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditGroup(group)}
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100 dark:hover:bg-white/10"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteGroup(group)}
                          disabled={isDeleting}
                          className="inline-flex items-center gap-2 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-500/25 dark:bg-transparent dark:text-rose-300 dark:hover:bg-rose-500/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {!students.length ? (
        <EmptyState
          icon={UserPlus}
          title="No se encontraron estudiantes"
          description={groups.length === 0 ? "Primero crea un grupo y luego agrega estudiantes vinculados a ese curso." : "Agrega estudiantes a tus grupos o utiliza la importación masiva para completar este listado."}
          action={
            <button
              type="button"
              onClick={groups.length === 0 ? openCreateGroup : () => setImportModalOpen(true)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-white/15 dark:text-slate-200 dark:hover:bg-white/10"
            >
              {groups.length === 0 ? "Crear grupo" : "Importar estudiantes"}
            </button>
          }
        />
      ) : (
        <Card className="glass-card-plus p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Estudiantes</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Este listado muestra los estudiantes registrados en tu cuenta.</p>
            </div>
            <div className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-blue-300">
              {students.length} registrados
            </div>
          </div>

          <div className="space-y-3 md:hidden">
            {students.map((student) => {
              const relatedGroup = Array.isArray(student.groups) ? student.groups[0] : student.groups;

              return (
                <div key={student.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-50">{student.full_name}</p>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                        {student.student_code ?? "Sin código"} · {relatedGroup?.name ?? "Sin grupo"}
                      </p>
                    </div>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        studentStatusStyles[student.status] ?? "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      {student.status}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{student.notes ?? "Sin observaciones"}</p>
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => openEditStudent(student)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100 dark:hover:bg-white/10 sm:px-4 sm:py-2.5 sm:text-sm"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteStudent(student)}
                      disabled={isDeleting}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-500/25 dark:bg-transparent dark:text-rose-300 dark:hover:bg-rose-500/10 sm:px-4 sm:py-2.5 sm:text-sm"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Eliminar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[980px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10">
                  <th className="py-2.5 text-left">Nombre</th>
                  <th className="text-left">Código</th>
                  <th className="text-left">Grupo</th>
                  <th className="text-left">Estado</th>
                  <th className="text-left">Observación</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  const relatedGroup = Array.isArray(student.groups) ? student.groups[0] : student.groups;

                  return (
                    <tr key={student.id} className="border-b border-slate-100 transition hover:bg-slate-50/80 dark:border-white/5 dark:hover:bg-white/[0.03]">
                      <td className="py-3 font-semibold tracking-tight">{student.full_name}</td>
                      <td className="font-medium text-slate-600 dark:text-slate-300">{student.student_code ?? "—"}</td>
                      <td>{relatedGroup?.name ?? "Sin grupo"}</td>
                      <td>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            studentStatusStyles[student.status] ?? "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          {student.status}
                        </span>
                      </td>
                      <td className="max-w-[360px] text-slate-600 dark:text-slate-300">{student.notes ?? "Sin observaciones"}</td>
                      <td className="py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditStudent(student)}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100 dark:hover:bg-white/10"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteStudent(student)}
                            disabled={isDeleting}
                            className="inline-flex items-center gap-2 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-500/25 dark:bg-transparent dark:text-rose-300 dark:hover:bg-rose-500/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <GroupFormDialog
        isOpen={groupModalOpen}
        group={selectedGroup}
        onClose={() => {
          setGroupModalOpen(false);
          setSelectedGroup(null);
        }}
        onCompleted={handleCompleted}
        createGroupAction={createGroupAction}
        updateGroupAction={updateGroupAction}
      />

      <StudentFormDialog
        isOpen={studentModalOpen}
        student={selectedStudent}
        groups={groupOptions}
        onClose={() => {
          setStudentModalOpen(false);
          setSelectedStudent(null);
        }}
        onCompleted={handleCompleted}
        createStudentAction={createStudentAction}
        updateStudentAction={updateStudentAction}
      />

      <ImportStudentsDialog
        isOpen={importModalOpen}
        groups={groupOptions}
        existingStudents={students.map((student) => ({
          groupId: student.group_id,
          studentCode: student.student_code
        }))}
        onClose={() => setImportModalOpen(false)}
        onCompleted={handleCompleted}
      />
    </section>
  );
};
