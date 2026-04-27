export type StudentReportStatusValue =
  | "destacado"
  | "estable"
  | "seguimiento"
  | "bajo_rendimiento"
  | "baja_asistencia"
  | "prioritario"
  | "sin_registro";

export type StudentReportSeverity = "success" | "neutral" | "warning" | "danger";

export type ObservationTone = "positive" | "negative" | "general" | "none";

export type StudentReportStatus = {
  status: StudentReportStatusValue;
  label: string;
  severity: StudentReportSeverity;
  reason: string;
  suggestedAction: string;
  countsAsAlert: boolean;
  observationTone: ObservationTone;
};

type StudentReportStatusInput = {
  attendanceAverage: number | null | undefined;
  averageScore: number | null | undefined;
  observation?: string | null;
  hasRecords?: boolean;
};

const positiveObservationTerms = [
  "muy bien",
  "excelente",
  "buen trabajo",
  "buen progreso",
  "demostro interes",
  "participo",
  "destacado",
  "responsable",
  "cumplio",
  "buena exposicion",
  "buen desempeno"
];

const negativeObservationTerms = [
  "no cumplio",
  "no participo",
  "se le olvido",
  "recochando",
  "distraido",
  "requiere apoyo",
  "bajo compromiso",
  "no entrego",
  "incumplio"
];

const normalizeText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

export const classifyObservationTone = (observation?: string | null): ObservationTone => {
  const normalized = observation ? normalizeText(observation) : "";

  if (!normalized) {
    return "none";
  }

  if (negativeObservationTerms.some((term) => normalized.includes(term))) {
    return "negative";
  }

  if (positiveObservationTerms.some((term) => normalized.includes(term))) {
    return "positive";
  }

  return "general";
};

const normalizeScoreToFive = (score: number | null | undefined) => {
  if (typeof score !== "number" || Number.isNaN(score)) {
    return null;
  }

  return score > 5 ? score / 20 : score;
};

const hasMetric = (value: number | null | undefined) => typeof value === "number" && !Number.isNaN(value);

export const getStudentReportStatus = ({
  attendanceAverage,
  averageScore,
  observation,
  hasRecords = true
}: StudentReportStatusInput): StudentReportStatus => {
  const normalizedScore = normalizeScoreToFive(averageScore);
  const hasAttendance = hasMetric(attendanceAverage);
  const hasScore = normalizedScore !== null;
  const observationTone = classifyObservationTone(observation);

  if (!hasRecords || (!hasAttendance && !hasScore)) {
    return {
      status: "sin_registro",
      label: "Sin registro",
      severity: "neutral",
      reason: "No hay datos suficientes para evaluar el desempeño.",
      suggestedAction: "Completar registros pendientes.",
      countsAsAlert: false,
      observationTone
    };
  }

  const lowScore = normalizedScore !== null && normalizedScore < 3;
  const lowAttendance = typeof attendanceAverage === "number" && attendanceAverage < 80;

  if (lowScore && lowAttendance) {
    return {
      status: "prioritario",
      label: "Seguimiento prioritario",
      severity: "danger",
      reason: "Presenta bajo rendimiento y baja asistencia.",
      suggestedAction: "Realizar acompañamiento individual y comunicar seguimiento al acudiente si aplica.",
      countsAsAlert: true,
      observationTone
    };
  }

  if (lowScore) {
    return {
      status: "bajo_rendimiento",
      label: "Bajo rendimiento",
      severity: "danger",
      reason: "Promedio inferior al nivel mínimo esperado.",
      suggestedAction: "Planificar refuerzo individual y verificar comprensión en la próxima actividad.",
      countsAsAlert: true,
      observationTone
    };
  }

  if (lowAttendance) {
    return {
      status: "baja_asistencia",
      label: "Baja asistencia",
      severity: "warning",
      reason: "Asistencia inferior al nivel esperado.",
      suggestedAction: "Revisar causas de inasistencia y realizar seguimiento.",
      countsAsAlert: true,
      observationTone
    };
  }

  if ((normalizedScore !== null && normalizedScore >= 3 && normalizedScore < 3.5) || observationTone === "negative") {
    return {
      status: "seguimiento",
      label: "Seguimiento sugerido",
      severity: "warning",
      reason:
        observationTone === "negative"
          ? "La observación sugiere acompañamiento formativo."
          : "El desempeño está en rango básico y conviene acompañar el avance.",
      suggestedAction:
        observationTone === "negative"
          ? "Revisar la situación descrita y reforzar acuerdos de trabajo."
          : "Reforzar conceptos puntuales en próximas actividades.",
      countsAsAlert: false,
      observationTone
    };
  }

  if (normalizedScore !== null && normalizedScore >= 4.5 && (!hasAttendance || attendanceAverage >= 90)) {
    return {
      status: "destacado",
      label: "Destacado",
      severity: "success",
      reason: "Buen desempeño académico y asistencia adecuada.",
      suggestedAction: "Mantener el acompañamiento y reconocer el avance.",
      countsAsAlert: false,
      observationTone
    };
  }

  return {
    status: "estable",
    label: "Estable",
    severity: "success",
    reason: "El estudiante mantiene un desempeño adecuado.",
    suggestedAction: "Continuar seguimiento regular.",
    countsAsAlert: false,
    observationTone
  };
};
