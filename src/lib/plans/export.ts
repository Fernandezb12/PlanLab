import { getEvaluationTypeLabel, normalizeEvaluationType } from "@/lib/validations/plans";

type RawPlanRecord = {
  title: string;
  subject: string;
  topic: string;
  duration_minutes: number;
  objective: string;
  resources: string | null;
  evaluation_type: string;
  plan_json?: Record<string, unknown> | null;
  groups?: { name: string; level: string | null } | { name: string; level: string | null }[] | null;
};

export type PlanMomentExport = {
  moment: string;
  minutes: number | null;
  activityName: string;
  description: string;
  technique: string;
};

export type NormalizedPlanExport = {
  title: string;
  subject: string;
  topic: string;
  durationMinutes: number;
  objective: string;
  evaluationType: string;
  resources: string | null;
  inicio: string;
  desarrollo: string;
  cierre: string;
  distribution: {
    inicio: number;
    desarrollo: number;
    cierre: number;
  } | null;
  observations: string | null;
  suggestions: string | null;
  aiAssisted: boolean;
  groupName: string;
  educationLevel: string | null;
  moments: PlanMomentExport[];
  resourceTags: string[];
  evaluationCriteria: string | null;
  diagnosis: string | null;
  teacherRecommendations: string | null;
  isReinforcement: boolean;
  modality: string;
};

const cleanText = (value: unknown) => (typeof value === "string" && value.trim() ? value.trim() : null);

const cleanNumber = (value: unknown) => (typeof value === "number" && Number.isFinite(value) ? value : null);

const splitResourceTags = (value: string | null) =>
  value
    ? value
        .split(/[,;\n]+/)
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 10)
    : [];

const normalizeResourceTags = (planJson: Record<string, unknown> | null, fallback: string | null) => {
  if (Array.isArray(planJson?.recursos_sugeridos)) {
    return planJson.recursos_sugeridos
      .map((item) => cleanText(item))
      .filter((item): item is string => Boolean(item))
      .slice(0, 10);
  }

  return splitResourceTags(cleanText(planJson?.resources) ?? cleanText(planJson?.recursos) ?? fallback);
};

const normalizeMomentsFromArray = (moments: unknown): PlanMomentExport[] => {
  if (!Array.isArray(moments)) {
    return [];
  }

  return moments
    .map((moment) => {
      if (!moment || typeof moment !== "object") {
        return null;
      }

      const record = moment as Record<string, unknown>;
      const momentName = cleanText(record.momento) ?? cleanText(record.moment) ?? "Momento";
      const activityName = cleanText(record.nombre_actividad) ?? cleanText(record.activityName) ?? momentName;
      const description = cleanText(record.descripcion) ?? cleanText(record.description) ?? activityName;

      return {
        moment: momentName,
        minutes: cleanNumber(record.tiempo_min) ?? cleanNumber(record.minutes),
        activityName,
        description,
        technique: cleanText(record.tecnica) ?? cleanText(record.technique) ?? "Estrategia guiada"
      };
    })
    .filter((moment): moment is PlanMomentExport => Boolean(moment));
};

const normalizeLegacyDistribution = (value: unknown) => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const inicio = cleanNumber(record.inicio);
  const desarrollo = cleanNumber(record.desarrollo);
  const cierre = cleanNumber(record.cierre);

  if (inicio === null || desarrollo === null || cierre === null) {
    return null;
  }

  return { inicio, desarrollo, cierre };
};

const normalizeMomentsFromLegacy = ({
  inicio,
  desarrollo,
  cierre,
  distribution,
  topic,
  objective
}: {
  inicio: string;
  desarrollo: string;
  cierre: string;
  distribution: NormalizedPlanExport["distribution"];
  topic: string;
  objective: string;
}): PlanMomentExport[] => [
  {
    moment: "Inicio",
    minutes: distribution?.inicio ?? null,
    activityName: `Activación: ${topic}`,
    description: inicio,
    technique: "Exploración de saberes previos"
  },
  {
    moment: "Desarrollo",
    minutes: distribution?.desarrollo ?? null,
    activityName: `Construcción del aprendizaje`,
    description: desarrollo,
    technique: "Trabajo guiado y práctica"
  },
  {
    moment: "Cierre",
    minutes: distribution?.cierre ?? null,
    activityName: "Síntesis y verificación",
    description: cierre || objective,
    technique: "Socialización y retroalimentación"
  }
].filter((moment) => moment.description.trim());

export const normalizePlanForExport = (plan: RawPlanRecord): NormalizedPlanExport => {
  const group = Array.isArray(plan.groups) ? plan.groups[0] : plan.groups;
  const planJson = plan.plan_json && typeof plan.plan_json === "object" ? (plan.plan_json as Record<string, unknown>) : null;
  const refuerzo = planJson?.refuerzo && typeof planJson.refuerzo === "object" ? (planJson.refuerzo as Record<string, unknown>) : null;
  const normalizedEvaluationType = normalizeEvaluationType(planJson?.evaluation_type ?? plan.evaluation_type) ?? "otra";
  const title = cleanText(planJson?.title) ?? plan.title;
  const subject = cleanText(planJson?.subject) ?? plan.subject;
  const topic = cleanText(planJson?.topic) ?? plan.topic;
  const durationMinutes = cleanNumber(planJson?.duration_minutes) ?? plan.duration_minutes;
  const objective = cleanText(planJson?.objetivo) ?? cleanText(planJson?.objective_refuerzo) ?? cleanText(planJson?.objective) ?? plan.objective;
  const resources = cleanText(planJson?.resources) ?? cleanText(planJson?.recursos) ?? plan.resources;
  const inicio = cleanText(planJson?.inicio) ?? "";
  const desarrollo = cleanText(planJson?.desarrollo) ?? "";
  const cierre = cleanText(planJson?.cierre) ?? "";
  const distribution = normalizeLegacyDistribution(planJson?.distribucion_tiempo);
  const momentsFromJson = normalizeMomentsFromArray(planJson?.momentos);
  const isReinforcement = Boolean(
    refuerzo ||
      cleanText(planJson?.objective_refuerzo) ||
      cleanText(planJson?.breve_diagnostico) ||
      title.toLowerCase().includes("refuerzo") ||
      topic.toLowerCase().includes("refuerzo")
  );

  return {
    title,
    subject,
    topic,
    durationMinutes,
    objective,
    evaluationType: getEvaluationTypeLabel(normalizedEvaluationType),
    resources,
    inicio: inicio || objective,
    desarrollo: desarrollo || `Desarrollar actividades guiadas sobre ${topic}.`,
    cierre: cierre || "Cerrar con socialización, verificación de aprendizajes y acuerdos de seguimiento.",
    distribution,
    observations: cleanText(planJson?.observaciones_docente) ?? cleanText(planJson?.observaciones_docentes),
    suggestions: cleanText(planJson?.sugerencias_metodologicas),
    aiAssisted: Boolean(planJson?.generated_with_ai || planJson?.ai_mode),
    groupName: group?.name ?? "Grupo",
    educationLevel: group?.level ?? null,
    moments:
      momentsFromJson.length > 0
        ? momentsFromJson
        : normalizeMomentsFromLegacy({
            inicio: inicio || objective,
            desarrollo: desarrollo || `Desarrollar actividades guiadas sobre ${topic}.`,
            cierre: cierre || "Cerrar con socialización, verificación de aprendizajes y acuerdos de seguimiento.",
            distribution,
            topic,
            objective
          }),
    resourceTags: normalizeResourceTags(planJson, resources),
    evaluationCriteria: cleanText(planJson?.criterio_evaluacion) ?? cleanText(refuerzo?.criterio_evaluacion),
    diagnosis: cleanText(planJson?.breve_diagnostico) ?? cleanText(refuerzo?.breve_diagnostico),
    teacherRecommendations: cleanText(planJson?.recomendaciones_docente) ?? cleanText(refuerzo?.recomendaciones_docente),
    isReinforcement,
    modality: planJson?.generated_with_ai || planJson?.ai_mode ? "Asistido por IA" : "Diseño docente"
  };
};
