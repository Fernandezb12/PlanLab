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
  alertReason: string | null;
  suggestedAction: string | null;
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

const pluralizeStudents = (count: number) =>
  count === 1 ? "1 estudiante requiere seguimiento específico." : `${count} estudiantes requieren seguimiento específico.`;

const getStudentStatus = ({
  attendanceAverage,
  averageScore,
  hasRecords,
  hasObservation
}: {
  attendanceAverage: number | null;
  averageScore: number | null;
  hasRecords: boolean;
  hasObservation: boolean;
}) => {
  if (!hasRecords || (attendanceAverage === null && averageScore === null)) {
    return {
      statusLabel: "Sin registro",
      alertReason: "sin registros consolidados",
      suggestedAction: "completar los registros pendientes para mejorar la lectura del proceso."
    };
  }

  const lowScore = isLowScore(averageScore);
  const lowAttendance = attendanceAverage !== null && attendanceAverage < 80;

  if (lowScore && lowAttendance) {
    return {
      statusLabel: "Seguimiento prioritario",
      alertReason: "bajo rendimiento e inasistencia",
      suggestedAction: "aplicar refuerzo individual y revisar participación en la próxima actividad."
    };
  }

  if (lowScore) {
    return {
      statusLabel: "Bajo rendimiento",
      alertReason: "bajo rendimiento",
      suggestedAction: "planificar refuerzo individual y verificar comprensión en la próxima actividad."
    };
  }

  if (lowAttendance) {
    return {
      statusLabel: "Baja asistencia",
      alertReason: "baja asistencia",
      suggestedAction: "revisar causas de inasistencia y acordar acciones de acompañamiento."
    };
  }

  if (hasObservation) {
    return {
      statusLabel: "Seguimiento",
      alertReason: "observación registrada",
      suggestedAction: "revisar la observación y mantener seguimiento formativo."
    };
  }

  return {
    statusLabel: "Estable",
    alertReason: null,
    suggestedAction: null
  };
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
    const status = getStudentStatus({
      attendanceAverage: studentAttendance,
      averageScore: studentAverage,
      hasRecords: studentRecords.length > 0,
      hasObservation: Boolean(observation)
    });

    return {
      id: student.id,
      studentName: student.full_name,
      studentCode: student.student_code,
      attendanceAverage: studentAttendance,
      averageScore: studentAverage,
      observation,
      ...status
    };
  });

  const studentsWithAlert = rows.filter((row) => row.statusLabel !== "Estable").length;
  const hasLowScoreStudents = rows.some((row) => row.statusLabel === "Bajo rendimiento" || row.statusLabel === "Seguimiento prioritario");
  const hasLowAttendanceStudents = rows.some((row) => row.statusLabel === "Baja asistencia" || row.statusLabel === "Seguimiento prioritario");
  const hasUnregisteredStudents = rows.some((row) => row.statusLabel === "Sin registro");
  const alerts = [
    ...(isLowScore(averageScore) ? ["El promedio general del grupo requiere refuerzo pedagógico."] : []),
    ...(attendanceAverage !== null && attendanceAverage < 80 ? ["La asistencia promedio requiere seguimiento."] : []),
    ...(studentsWithAlert > 0 ? [pluralizeStudents(studentsWithAlert)] : []),
    ...(records.length === 0 ? ["No hay registros individuales suficientes para consolidar el reporte."] : [])
  ];

  const observations = records
    .map((record) => record.observation?.trim())
    .filter((observation): observation is string => Boolean(observation))
    .slice(0, 8);

  const recommendations = [
    ...(hasLowScoreStudents || isLowScore(averageScore)
      ? ["Planificar una actividad de refuerzo y realizar seguimiento individual a los estudiantes con desempeño bajo."]
      : []),
    ...(hasUnregisteredStudents ? ["Completar los registros pendientes para mejorar la lectura del grupo."] : []),
    ...(hasLowAttendanceStudents || (attendanceAverage !== null && attendanceAverage < 80)
      ? ["Revisar causas de inasistencia y establecer acciones de acompañamiento."]
      : []),
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
