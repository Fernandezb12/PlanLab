import { AlertTriangle, ChartColumn, CircleAlert, ClipboardCheck, Users } from "lucide-react";

import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ModuleHeader } from "@/components/ui/module-header";

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
};

type AlertItem = {
  id: string;
  text: string;
  tone: "warning" | "risk" | "info";
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

const toneStyles: Record<GroupSummary["tone"], string> = {
  stable: "border-emerald-500/20 bg-emerald-500/10 text-emerald-200",
  watch: "border-amber-500/20 bg-amber-500/10 text-amber-200",
  risk: "border-rose-500/20 bg-rose-500/10 text-rose-200"
};

const alertStyles: Record<AlertItem["tone"], string> = {
  warning: "border-amber-300/40 bg-amber-500/10 text-amber-100",
  risk: "border-rose-400/40 bg-rose-500/10 text-rose-100",
  info: "border-blue-400/30 bg-blue-500/10 text-blue-100"
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
}: ResultsPanelProps) => (
  <section className="space-y-6">
    <ModuleHeader title="Resultados" subtitle="Indicadores reales para seguir asistencia, rendimiento y alertas por grupo." />

    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Card className="glass-card-plus p-5">
        <p className="text-sm text-slate-500 dark:text-slate-400">Promedio general</p>
        <p className="mt-2 text-4xl font-bold tracking-tight">{formatScore(generalAverage, "0.0")}</p>
        <p className="mt-2 text-sm text-slate-400">Basado en registros con nota real.</p>
      </Card>

      <Card className="glass-card-plus p-5">
        <p className="text-sm text-slate-500 dark:text-slate-400">Asistencia promedio</p>
        <p className="mt-2 text-4xl font-bold tracking-tight">{formatPercent(attendanceAverage, "0%")}</p>
        <p className="mt-2 text-sm text-slate-400">Calculada sobre {totalRecords} registros guardados.</p>
      </Card>

      <Card className="glass-card-plus p-5">
        <p className="text-sm text-slate-500 dark:text-slate-400">Grupos con dificultad</p>
        <p className="mt-2 text-4xl font-bold tracking-tight">{groupsWithDifficulty}</p>
        <p className="mt-2 text-sm text-slate-400">Promedio bajo o asistencia frágil.</p>
      </Card>

      <Card className="glass-card-plus p-5">
        <p className="text-sm text-slate-500 dark:text-slate-400">Estudiantes con alerta</p>
        <p className="mt-2 text-4xl font-bold tracking-tight">{studentsWithAlert}</p>
        <p className="mt-2 text-sm text-slate-400">{pendingActivitiesCount} actividades siguen sin registro consolidado.</p>
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
            description="Registra resultados de actividades para ver la evolución real de cada grupo."
          />
        ) : (
          <div className="space-y-3">
            {groupSummaries.map((group) => (
              <div key={group.id} className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-white">{group.name}</p>
                    <p className="mt-1 text-sm text-slate-400">
                      {group.level ?? "Sin nivel"} · {group.studentsCount} estudiantes · {group.recordedActivitiesCount}/{group.activitiesCount} actividades con registro
                    </p>
                  </div>
                  <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${toneStyles[group.tone]}`}>
                    {group.tone === "stable" ? "Estable" : group.tone === "watch" ? "Seguimiento" : "Riesgo"}
                  </span>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <div className="mb-1 flex items-center justify-between text-sm text-slate-300">
                      <span>Promedio</span>
                      <span>{formatScore(group.averageScore)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10">
                      <div className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" style={{ width: `${Math.max(8, Math.min(100, group.averageScore ?? 0))}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 flex items-center justify-between text-sm text-slate-300">
                      <span>Asistencia</span>
                      <span>{formatPercent(group.attendanceRate)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10">
                      <div className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-lime-400" style={{ width: `${Math.max(8, Math.min(100, group.attendanceRate ?? 0))}%` }} />
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
              description="Cuando detectemos riesgos reales en asistencia o rendimiento, aparecerán aquí."
            />
          ) : (
            <div className="space-y-2">
              {alerts.map((alert) => (
                <div key={alert.id} className={`rounded-xl border px-3 py-2 text-sm ${alertStyles[alert.tone]}`}>
                  {alert.text}
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

          <div className="space-y-3 text-sm text-slate-300">
            <p className="flex items-start gap-2">
              <Users className="mt-0.5 h-4 w-4 text-blue-400" />
              Promedio general: <span className="font-semibold text-white">{formatScore(generalAverage, "Sin datos")}</span>
            </p>
            <p className="flex items-start gap-2">
              <CircleAlert className="mt-0.5 h-4 w-4 text-violet-400" />
              Asistencia promedio: <span className="font-semibold text-white">{formatPercent(attendanceAverage, "Sin datos")}</span>
            </p>
            <p className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-400" />
              Actividades pendientes de registrar: <span className="font-semibold text-white">{pendingActivitiesCount}</span>
            </p>
          </div>
        </Card>
      </div>
    </div>
  </section>
);
