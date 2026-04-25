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
  statusLabel: string;
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
  alerts: string[];
  observations: string[];
  recommendations: string[];
  executiveSummary: string;
  students: ReportExportStudentRow[];
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

const formatMetric = (value: number | null, suffix = "") => (value === null ? "sin datos" : `${suffix === "%" ? Math.round(value) : value.toFixed(1)}${suffix}`);

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
    const statusLabel = isLowScore(studentAverage)
      ? "Bajo rendimiento"
      : studentAttendance !== null && studentAttendance < 75
        ? "Inasistencia"
        : observation
          ? "Seguimiento"
          : "Estable";

    return {
      id: student.id,
      studentName: student.full_name,
      studentCode: student.student_code,
      attendanceAverage: studentAttendance,
      averageScore: studentAverage,
      observation,
      statusLabel
    };
  });

  const studentsWithAlert = rows.filter((row) => row.statusLabel !== "Estable").length;
  const alerts = [
    ...(isLowScore(averageScore) ? ["El promedio general del grupo requiere refuerzo pedagógico."] : []),
    ...(attendanceAverage !== null && attendanceAverage < 75 ? ["La asistencia promedio requiere seguimiento."] : []),
    ...(studentsWithAlert > 0 ? [`${studentsWithAlert} estudiantes requieren seguimiento específico.`] : []),
    ...(records.length === 0 ? ["No hay registros individuales suficientes para consolidar el reporte."] : [])
  ];

  const observations = records
    .map((record) => record.observation?.trim())
    .filter((observation): observation is string => Boolean(observation))
    .slice(0, 8);

  const recommendations = [
    ...(isLowScore(averageScore) ? ["Planificar una actividad de refuerzo con seguimiento individual a los desempeños bajos."] : []),
    ...(attendanceAverage !== null && attendanceAverage < 75 ? ["Revisar causas de inasistencia y acordar acciones de acompañamiento con el grupo."] : []),
    ...(alerts.length === 0 ? ["El grupo mantiene un comportamiento estable. Continuar con seguimiento periódico y retroalimentación formativa."] : [])
  ];

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
    alerts,
    observations,
    recommendations,
    executiveSummary:
      records.length === 0
        ? `El grupo ${groupName} aún no cuenta con registros individuales suficientes para consolidar indicadores académicos.`
        : `El grupo ${groupName} presenta una asistencia promedio de ${formatMetric(attendanceAverage, "%")} y un promedio general de ${formatMetric(
            averageScore
          )}. ${alerts.length ? "Se identifican alertas que requieren seguimiento pedagógico." : "No se identifican alertas críticas en este corte."}`,
    students: rows
  };
};
