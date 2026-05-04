"use client";

import { AlertTriangle, ChartColumn, CircleAlert, ClipboardCheck, Sparkles, Users } from "lucide-react";
import { useState } from "react";

import { DocumentExportMenu } from "@/components/pdf/document-export-menu";
import { AnimatedBar } from "@/components/ui/animated-bar";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ModuleHeader } from "@/components/ui/module-header";
import { ReinforcementDialog } from "@/features/results/reinforcement-dialog";
import { type GenerateReinforcementInput } from "@/lib/validations/ai";

type GroupSummary = {
  id: string;
  name: string;
  level: string | null;
  studentsCount: number;
  activitiesCount: number;
  recordedActivitiesCount: number;
  averageScore: number | null;
  attendanceRate: number | null;
  tone: "stable" | "watch" | "risk";
  reinforcementContext: GenerateReinforcementInput & {
    currentStatusLabel?: string | null;
  };
};

type AlertItem = {
  id: string;
  text: string;
  tone: "warning" | "risk" | "info";
  reinforcementContext?: GenerateReinforcementInput;
};

type ResultsPanelProps = {
  generalAverage: number | null;
  attendanceAverage: number | null;
  groupsWithDifficulty: number;
  studentsWithAlert: number;
  pendingActivitiesCount: number;
  totalRecords: number;
  groupSummaries: GroupSummary[];
  alerts: AlertItem[];
};

const formatScore = (value: number | null, fallback = "Sin notas") => (value === null ? fallback : value.toFixed(1));
const formatPercent = (value: number | null, fallback = "Sin registros") => (value === null ? fallback : `${Math.round(value)}%`);
const scoreBarValue = (value: number | null) => (value === null ? 0 : Math.max(8, Math.min(100, value <= 5 ? (value / 5) * 100 : value)));

const toneStyles: Record<GroupSummary["tone"], string> = {
  stable: "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200",
  watch: "border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200",
  risk: "border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200"
};

const alertStyles: Record<AlertItem["tone"], string> = {
  warning: "border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-300/40 dark:bg-amber-500/10 dark:text-amber-100",
  risk: "border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/40 dark:bg-rose-500/10 dark:text-rose-100",
  info: "border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-400/30 dark:bg-blue-500/10 dark:text-blue-100"
};

export const ResultsPanel = ({
  generalAverage,
  attendanceAverage,
  groupsWithDifficulty,
  studentsWithAlert,
  pendingActivitiesCount,
  totalRecords,
  groupSummaries,
  alerts
}: ResultsPanelProps) => {
  const [selectedReinforcement, setSelectedReinforcement] = useState<GenerateReinforcementInput | null>(null);

  return (
    <section className="space-y-6">
      <ModuleHeader title="Resultados" subtitle="Consulta indicadores de asistencia, rendimiento y alertas por grupo." />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="glass-card-plus p-5 transition duration-300 hover:-translate-y-0.5">
          <p className="text-sm text-slate-500 dark:text-slate-400">Promedio general</p>
          <p className="mt-2 text-4xl font-bold tracking-tight">
            <AnimatedNumber value={generalAverage ?? 0} decimals={1} />
          </p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Calculado con las notas registradas en las actividades.</p>
        </Card>

        <Card className="glass-card-plus p-5 transition duration-300 hover:-translate-y-0.5">
          <p className="text-sm text-slate-500 dark:text-slate-400">Asistencia promedio</p>
          <p className="mt-2 text-4xl font-bold tracking-tight">
            <AnimatedNumber value={attendanceAverage ?? 0} suffix="%" />
          </p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Calculada a partir de {totalRecords} registros guardados.</p>
        </Card>

        <Card className="glass-card-plus p-5 transition duration-300 hover:-translate-y-0.5">
          <p className="text-sm text-slate-500 dark:text-slate-400">Grupos con dificultad</p>
          <p className="mt-2 text-4xl font-bold tracking-tight">
            <AnimatedNumber value={groupsWithDifficulty} />
          </p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Grupos que requieren seguimiento cercano.</p>
        </Card>

        <Card className="glass-card-plus p-5 transition duration-300 hover:-translate-y-0.5">
          <p className="text-sm text-slate-500 dark:text-slate-400">Estudiantes con alerta</p>
          <p className="mt-2 text-4xl font-bold tracking-tight">
            <AnimatedNumber value={studentsWithAlert} />
          </p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{pendingActivitiesCount} actividades aún no tienen registro consolidado.</p>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="glass-card-plus p-5">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold tracking-tight">
            <ChartColumn className="h-5 w-5 text-violet-500" />
            Progreso por grupo
          </h2>

          {totalRecords === 0 ? (
            <EmptyState
              icon={ChartColumn}
              title="Aún no hay resultados consolidados"
              description="Registra asistencia, notas u observaciones en tus actividades para visualizar la evolución de cada grupo."
            />
          ) : (
            <div className="space-y-3">
              {groupSummaries.map((group) => (
                <div key={group.id} className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/15 dark:hover:bg-white/[0.05]">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-slate-950 dark:text-white">{group.name}</p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {group.level ?? "Sin nivel"} · {group.studentsCount} estudiantes · {group.recordedActivitiesCount}/{group.activitiesCount} actividades con registro
                      </p>
                      {group.reinforcementContext.currentStatusLabel ? (
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">Estado más reciente: {group.reinforcementContext.currentStatusLabel}</p>
                      ) : null}
                    </div>
                    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${toneStyles[group.tone]}`}>
                      {group.tone === "stable" ? "Estable" : group.tone === "watch" ? "Seguimiento" : "Riesgo"}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
                    <button
                      type="button"
                      onClick={() => setSelectedReinforcement(group.reinforcementContext)}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-violet-300 bg-violet-50 px-3 py-2 text-sm font-medium text-violet-700 transition hover:bg-violet-100 dark:border-violet-500/30 dark:bg-transparent dark:text-violet-200 dark:hover:bg-violet-500/10 sm:w-auto"
                    >
                      <Sparkles className="h-4 w-4" />
                      Generar refuerzo
                    </button>
                    <DocumentExportMenu pdfEndpoint={`/api/export/results?groupId=${group.id}`} />
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <div className="mb-1 flex items-center justify-between text-sm text-slate-700 dark:text-slate-300">
                        <span>Promedio</span>
                        <span>{formatScore(group.averageScore)}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                        <AnimatedBar value={scoreBarValue(group.averageScore)} className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-700" />
                      </div>
                    </div>

                    <div>
                      <div className="mb-1 flex items-center justify-between text-sm text-slate-700 dark:text-slate-300">
                        <span>Asistencia</span>
                        <span>{formatPercent(group.attendanceRate)}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                        <AnimatedBar value={Math.max(8, Math.min(100, group.attendanceRate ?? 0))} className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-lime-400 transition-all duration-700" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <div className="space-y-4">
          <Card className="glass-card-plus p-5">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold tracking-tight">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Alertas
            </h2>

            {alerts.length === 0 ? (
              <EmptyState
                icon={AlertTriangle}
                title="No hay alertas activas por ahora"
                description="Las señales de riesgo en asistencia o rendimiento aparecerán resumidas en este espacio."
              />
            ) : (
              <div className="space-y-2">
                {alerts.map((alert) => (
                  <div key={alert.id} className={`rounded-xl border px-3 py-2 text-sm ${alertStyles[alert.tone]}`}>
                    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                      <span>{alert.text}</span>
                      {alert.reinforcementContext ? (
                        <button
                          type="button"
                          onClick={() => setSelectedReinforcement(alert.reinforcementContext ?? null)}
                          className="inline-flex w-full items-center justify-center gap-1 rounded-lg border border-violet-300 bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700 transition hover:bg-violet-100 dark:border-violet-500/30 dark:bg-transparent dark:text-violet-100 dark:hover:bg-violet-500/10 sm:w-auto"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          Refuerzo
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="glass-card-plus p-5">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold tracking-tight">
              <ClipboardCheck className="h-5 w-5 text-blue-500" />
              Lectura rápida
            </h2>

            <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
              <p className="flex items-start gap-2">
                <Users className="mt-0.5 h-4 w-4 text-blue-400" />
                Promedio general: <span className="font-semibold text-slate-950 dark:text-white">{formatScore(generalAverage, "Sin datos")}</span>
              </p>
              <p className="flex items-start gap-2">
                <CircleAlert className="mt-0.5 h-4 w-4 text-violet-400" />
                Asistencia promedio: <span className="font-semibold text-slate-950 dark:text-white">{formatPercent(attendanceAverage, "Sin datos")}</span>
              </p>
              <p className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-400" />
                Actividades pendientes por registrar: <span className="font-semibold text-slate-950 dark:text-white">{pendingActivitiesCount}</span>
              </p>
            </div>
          </Card>
        </div>
      </div>

      <ReinforcementDialog isOpen={Boolean(selectedReinforcement)} input={selectedReinforcement} onClose={() => setSelectedReinforcement(null)} />
    </section>
  );
};
