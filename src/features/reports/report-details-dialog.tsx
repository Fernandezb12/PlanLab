"use client";

import { CalendarDays, FileDown, FolderKanban, GraduationCap } from "lucide-react";

import { Modal } from "@/components/ui/modal";
import { getReportTypeLabel } from "@/lib/validations/reports";

type ReportRecord = {
  id: string;
  report_type: string;
  file_url: string | null;
  created_at: string;
  groups: { name: string; level: string | null } | { name: string; level: string | null }[] | null;
  activities: { title: string; activity_date: string | null } | { title: string; activity_date: string | null }[] | null;
};

type ReportDetailsDialogProps = {
  isOpen: boolean;
  report: ReportRecord | null;
  onClose: () => void;
};

const formatDate = (value: string | null) => {
  if (!value) {
    return "Sin fecha";
  }

  return new Date(value).toLocaleDateString("es-CO", {
    dateStyle: "long"
  });
};

export const ReportDetailsDialog = ({ isOpen, report, onClose }: ReportDetailsDialogProps) => {
  const relatedGroup = report ? (Array.isArray(report.groups) ? report.groups[0] : report.groups) : null;
  const relatedActivity = report ? (Array.isArray(report.activities) ? report.activities[0] : report.activities) : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalle del reporte"
      description="Consulta el contexto académico asociado al reporte y su disponibilidad de exportación."
      contentClassName="max-w-3xl"
    >
      {report ? (
        <div className="space-y-5">
          <div className="rounded-[26px] border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04]">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Reporte registrado</p>
                <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">{getReportTypeLabel(report.report_type)}</h3>
              </div>
              <span className="inline-flex rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                {report.file_url ? "PDF disponible" : "Pendiente de exportación"}
              </span>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-900/70">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                  <FolderKanban className="h-4 w-4 text-violet-500" />
                  Grupo
                </div>
                <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                  {relatedGroup?.name ?? "Sin grupo"}
                  {relatedGroup?.level ? ` · ${relatedGroup.level}` : ""}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-900/70">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                  <GraduationCap className="h-4 w-4 text-blue-500" />
                  Actividad asociada
                </div>
                <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{relatedActivity?.title ?? "Reporte general del grupo"}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{formatDate(relatedActivity?.activity_date ?? null)}</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-900/70">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                  <CalendarDays className="h-4 w-4 text-emerald-500" />
                  Fecha de creación
                </div>
                <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{formatDate(report.created_at)}</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-900/70">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                  <FileDown className="h-4 w-4 text-amber-500" />
                  Estado del documento
                </div>
                <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                  {report.file_url
                    ? "El documento ya fue generado y puede descargarse desde el menú de exportación."
                    : "El reporte está listo para exportarse cuando se necesite el documento final."}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
            >
              Cerrar
            </button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
};
