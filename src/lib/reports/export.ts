import {
  classifyObservationTone,
  getStudentReportStatus,
  type ObservationTone,
  type StudentReportSeverity,
  type StudentReportStatusValue
} from "@/lib/reports/status";

export type ReportExportStudentInput = {
  id: string;
  full_name: string;
  student_code: string | null;
};

export type ReportExportRecordInput = {
  student_id: string;
  attended: boolean;
  result_score: number | null;
  observation: string | null;
  activity_id?: string | null;
};

export type ReportExportStudentRow = {
  id: string;
  studentName: string;
  studentCode: string | null;
  attendanceAverage: number | null;
  averageScore: number | null;
  observation: string | null;
  status: StudentReportStatusValue;
  severity: StudentReportSeverity;
  statusLabel: string;
  alertReason: string | null;
  reason: string;
  suggestedAction: string;
  countsAsAlert: boolean;
  observationTone: ObservationTone;
};

export type ReportExportData = {
  teacherName: string;
  generatedAt: string;
  reportType: string;
  reportSubtitle: string;
  groupName: string;
  educationLevel: string | null;
  activityTitle: string | null;
  totalStudents: number;
  recordsAnalyzed: number;
  activitiesAnalyzed: number;
  averageScore: number | null;
  attendanceAverage: number | null;
  alertCount: number;
  suggestedFollowUpCount: number;
  outstandingCount: number;
  stableCount: number;
  unregisteredCount: number;
  alerts: string[];
  observations: string[];
  positiveObservations: string[];
  followUpObservations: string[];
  generalObservations: string[];
  recommendations: string[];
  executiveSummary: string;
  students: ReportExportStudentRow[];
  priorityStudents: ReportExportStudentRow[];
  suggestedStudents: ReportExportStudentRow[];
  followUpStudents: ReportExportStudentRow[];
};

type BuildReportExportDataInput = {
  teacherName: string;
  generatedAt: string;
  reportType: string;
  reportTypeLabel: string;
  groupName: string;
  educationLevel: string | null;
  activityTitle: string | null;
  students: ReportExportStudentInput[];
  records: ReportExportRecordInput[];
  activitiesAnalyzed: number;
};

const average = (values: number[]) => (values.length ? values.reduce((total, value) => total + value, 0) / values.length : null);

const isLowScore = (value: number | null) => {
  if (value === null) {
    return false;
  }

  return value <= 5 ? value < 3 : value < 60;
};

const pluralizePriorityStudents = (count: number) =>
  count === 1 ? "1 estudiante requiere seguimiento prioritario." : `${count} estudiantes requieren seguimiento prioritario.`;

const reportSubtitleFor = (reportType: string, reportTypeLabel: string) => {
  if (reportType === "asistencia") {
    return "Reporte de asistencia";
  }

  if (reportType === "rendimiento") {
    return "Reporte de rendimiento";
  }

  if (reportType === "comparativo") {
    return "Reporte comparativo";
  }

  if (reportType === "consolidado") {
    return "Reporte general del grupo";
  }

  return `Reporte de ${reportTypeLabel.toLowerCase()}`;
};

const unique = (items: string[]) => Array.from(new Set(items));

export const buildReportExportData = ({
  teacherName,
  generatedAt,
  reportType,
  reportTypeLabel,
  groupName,
  educationLevel,
  activityTitle,
  students,
  records,
  activitiesAnalyzed
}: BuildReportExportDataInput): ReportExportData => {
  const scoreValues = records.map((record) => record.result_score).filter((score): score is number => typeof score === "number");
  const averageScore = average(scoreValues);
  const attendanceAverage = records.length ? (records.filter((record) => record.attended).length / records.length) * 100 : null;

  const rows = students.map((student) => {
    const studentRecords = records.filter((record) => record.student_id === student.id);
    const studentScores = studentRecords.map((record) => record.result_score).filter((score): score is number => typeof score === "number");
    const studentAverage = average(studentScores);
    const studentAttendance = studentRecords.length ? (studentRecords.filter((record) => record.attended).length / studentRecords.length) * 100 : null;
    const observation = studentRecords.map((record) => record.observation?.trim()).find(Boolean) ?? null;
    const status = getStudentReportStatus({
      attendanceAverage: studentAttendance,
      averageScore: studentAverage,
      hasRecords: studentRecords.length > 0,
      observation
    });

    return {
      id: student.id,
      studentName: student.full_name,
      studentCode: student.student_code,
      attendanceAverage: studentAttendance,
      averageScore: studentAverage,
      observation,
      status: status.status,
      severity: status.severity,
      statusLabel: status.label,
      alertReason: status.countsAsAlert || status.status === "seguimiento" ? status.reason : null,
      reason: status.reason,
      suggestedAction: status.suggestedAction,
      countsAsAlert: status.countsAsAlert,
      observationTone: status.observationTone
    };
  });

  const alertCount = rows.filter((row) => row.countsAsAlert).length;
  const suggestedStudents = rows.filter((row) => row.status === "seguimiento");
  const priorityStudents = rows.filter((row) => row.countsAsAlert);
  const followUpStudents = [...priorityStudents, ...suggestedStudents];
  const suggestedFollowUpCount = suggestedStudents.length;
  const outstandingCount = rows.filter((row) => row.status === "destacado").length;
  const stableCount = rows.filter((row) => row.status === "estable").length;
  const unregisteredCount = rows.filter((row) => row.status === "sin_registro").length;
  const hasLowScoreStudents = rows.some((row) => row.status === "bajo_rendimiento" || row.status === "prioritario");
  const hasLowAttendanceStudents = rows.some((row) => row.status === "baja_asistencia" || row.status === "prioritario");
  const alerts = [
    ...(isLowScore(averageScore) ? ["El promedio general del grupo requiere refuerzo pedagógico."] : []),
    ...(attendanceAverage !== null && attendanceAverage < 80 ? ["La asistencia promedio requiere seguimiento."] : []),
    ...(alertCount > 0 ? [pluralizePriorityStudents(alertCount)] : [])
  ];

  const allObservations = unique(
    records
      .map((record) => record.observation?.trim())
      .filter((observation): observation is string => Boolean(observation))
  ).slice(0, 12);

  const positiveObservations = allObservations.filter((observation) => classifyObservationTone(observation) === "positive");
  const followUpObservations = allObservations.filter((observation) => classifyObservationTone(observation) === "negative");
  const generalObservations = allObservations.filter((observation) => classifyObservationTone(observation) === "general");
  const observations = allObservations;

  const studentRecommendations = unique(
    followUpStudents
      .map((student) => student.suggestedAction)
      .filter(Boolean)
  ).slice(0, 4);

  const recommendations = [
    ...studentRecommendations,
    ...(hasLowScoreStudents || isLowScore(averageScore)
      ? ["Planificar una actividad de refuerzo y realizar seguimiento individual a los estudiantes con desempeño bajo."]
      : []),
    ...(unregisteredCount > 0 ? ["Completar los registros pendientes para mejorar la lectura del grupo."] : []),
    ...(hasLowAttendanceStudents || (attendanceAverage !== null && attendanceAverage < 80)
      ? ["Revisar causas de inasistencia y establecer acciones de acompañamiento."]
      : []),
    ...(alertCount === 0 && suggestedFollowUpCount === 0
      ? ["El grupo mantiene un comportamiento estable. Continuar con seguimiento periódico y retroalimentación formativa."]
      : [])
  ];

  const executiveSummary =
    records.length === 0
      ? `El grupo ${groupName} aún no cuenta con registros individuales suficientes para consolidar indicadores académicos.`
      : alertCount > 0
        ? `Se identifican ${alertCount} ${alertCount === 1 ? "estudiante con alerta académica o de asistencia que requiere" : "estudiantes con alerta académica o de asistencia que requieren"} seguimiento prioritario.`
        : suggestedFollowUpCount > 0
          ? "Se identifican estudiantes con seguimiento sugerido, sin alertas críticas."
          : "El grupo presenta un comportamiento general estable. Se registran observaciones docentes para seguimiento formativo.";

  return {
    teacherName,
    generatedAt,
    reportType: reportTypeLabel,
    reportSubtitle: reportSubtitleFor(reportType, reportTypeLabel),
    groupName,
    educationLevel,
    activityTitle,
    totalStudents: students.length,
    recordsAnalyzed: records.length,
    activitiesAnalyzed,
    averageScore,
    attendanceAverage,
    alertCount,
    suggestedFollowUpCount,
    outstandingCount,
    stableCount,
    unregisteredCount,
    alerts,
    observations,
    positiveObservations,
    followUpObservations,
    generalObservations,
    recommendations: unique(recommendations).slice(0, 6),
    executiveSummary,
    students: rows,
    priorityStudents,
    suggestedStudents,
    followUpStudents
  };
};
