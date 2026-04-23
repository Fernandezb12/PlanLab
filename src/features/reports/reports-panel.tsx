"use client";

import { Eye, FileDown, FilePlus2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { DocumentExportMenu } from "@/components/pdf/document-export-menu";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ModuleHeader } from "@/components/ui/module-header";
import { createReportAction, deleteReportAction, type ReportActionResult } from "@/features/reports/actions";
import { ReportDetailsDialog } from "@/features/reports/report-details-dialog";
import { ReportFormDialog } from "@/features/reports/report-form-dialog";
import { reportTypeLabels } from "@/lib/validations/reports";

type GroupOption = {
  id: string;
  name: string;
  level: string | null;
};

type ActivityOption = {
  id: string;
  title: string;
  group_id: string | null;
  activity_date: string | null;
};

type ReportRecord = {
  id: string;
  report_type: string;
  file_url: string | null;
  created_at: string;
  groups: { name: string; level: string | null } | { name: string; level: string | null }[] | null;
  activities: { title: string; activity_date: string | null } | { title: string; activity_date: string | null }[] | null;
};

type FeedbackState = {
  tone: "success" | "error";
  message: string;
} | null;

type ReportsPanelProps = {
  groups: GroupOption[];
  activities: ActivityOption[];
  reports: ReportRecord[];
};

const getReportTypeLabel = (reportType: string) => reportTypeLabels[reportType as keyof typeof reportTypeLabels] ?? "Reporte";

export const ReportsPanel = ({ groups, activities, reports }: ReportsPanelProps) => {
  const router = useRouter();
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportRecord | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();

  const handleCompleted = (result: ReportActionResult) => {
    setFeedback({
      tone: result.success ? "success" : "error",
      message: result.message
    });

    if (result.success) {
      setIsFormOpen(false);
      router.refresh();
    }
  };

  const openDetails = (report: ReportRecord) => {
    setSelectedReport(report);
    setIsDetailsOpen(true);
  };

  const handleDeleteReport = (report: ReportRecord) => {
    if (!window.confirm(`Se eliminará el reporte "${getReportTypeLabel(report.report_type)}". ¿Quieres continuar?`)) {
      return;
    }

    startDeleteTransition(async () => {
      const result = await deleteReportAction(report.id);
      handleCompleted(result);
    });
  };

  return (
    <section className="space-y-6">
      <ModuleHeader
        title="Reportes"
        subtitle="Consulta y organiza los reportes generados a partir de la información del sistema."
        actions={
          <button
            type="button"
            onClick={() => setIsFormOpen(true)}
            disabled={groups.length === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-slate-500 to-slate-700 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FilePlus2 className="h-4 w-4" />
            Crear reporte
          </button>
        }
      />

      {feedback ? (
        <div className={`rounded-2xl border px-4 py-3 text-sm ${feedback.tone === "success" ? "semantic-success" : "semantic-risk"}`}>
          {feedback.message}
        </div>
      ) : null}

      {groups.length === 0 ? (
        <EmptyState
          icon={FileDown}
          title="Primero crea grupos para consolidar reportes"
          description="Los reportes se construyen a partir de tus grupos, actividades y resultados. Crea un grupo para comenzar."
        />
      ) : reports.length === 0 ? (
        <EmptyState
          icon={FileDown}
          title="Aún no tienes reportes generados"
          description="Cuando registres actividades y resultados, los reportes podrán consolidarse desde este módulo."
          action={
            <button
              type="button"
              onClick={() => setIsFormOpen(true)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-white/15 dark:text-slate-200 dark:hover:bg-white/10"
            >
              Crear primer reporte
            </button>
          }
        />
      ) : (
        <div className="grid gap-3">
          {reports.map((report) => {
            const relatedGroup = Array.isArray(report.groups) ? report.groups[0] : report.groups;
            const relatedActivity = Array.isArray(report.activities) ? report.activities[0] : report.activities;

            return (
              <Card key={report.id} className="glass-card-plus p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <h2 className="text-lg font-bold tracking-tight">{getReportTypeLabel(report.report_type)}</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {relatedGroup?.name ?? "Sin grupo"} {relatedGroup?.level ? `· ${relatedGroup.level}` : ""} ·{" "}
                      {relatedActivity?.title ?? "Sin actividad específica"} · {new Date(report.created_at).toLocaleDateString("es-CO")}
                    </p>
                    <p className="mt-2 text-xs text-slate-400">
                      {report.file_url ? "Documento disponible para consulta o descarga." : "El reporte quedó registrado y listo para exportarse cuando lo necesites."}
                    </p>
                  </div>

                  <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
                    <button
                      type="button"
                      onClick={() => openDetails(report)}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:bg-transparent dark:text-slate-200 dark:hover:bg-white/10 sm:w-auto"
                    >
                      <Eye className="h-4 w-4" />
                      Ver detalle
                    </button>
                    <DocumentExportMenu
                      pdfEndpoint={`/api/export/reports/${report.id}`}
                      tone="primary"
                      preferredSide="top"
                      showViewPdf={false}
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteReport(report)}
                      disabled={isDeleting}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-500/25 dark:bg-transparent dark:text-rose-300 dark:hover:bg-rose-500/10 sm:w-auto"
                    >
                      <Trash2 className="h-4 w-4" />
                      Eliminar
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <ReportFormDialog
        isOpen={isFormOpen}
        groups={groups}
        activities={activities}
        onClose={() => setIsFormOpen(false)}
        onCompleted={handleCompleted}
        createReportAction={createReportAction}
      />

      <ReportDetailsDialog
        isOpen={isDetailsOpen}
        report={selectedReport}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedReport(null);
        }}
      />
    </section>
  );
};
