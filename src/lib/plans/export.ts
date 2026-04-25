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

const cleanNumber = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

const splitResourceTags = (value: string | null) =>
  value
    ? value
        .split(/[,;\n]+/)
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 10)
    : [];

const isUrl = (value: string) => /^https?:\/\//i.test(value.trim());

const cleanResourceLabel = (value: string) => {
  const resource = value.trim();

  if (!resource) {
    return null;
  }

  if (!isUrl(resource)) {
    return resource;
  }

  try {
    const url = new URL(resource);
    const host = url.hostname.replace(/^www\./, "");
    return `Recurso digital (${host})`;
  } catch {
    return "Recurso digital";
  }
};

const dedupeValues = (values: string[]) => Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));

const normalizeResourceTags = (planJson: Record<string, unknown> | null, fallback: string | null) => {
  const values = Array.isArray(planJson?.recursos_sugeridos)
    ? planJson.recursos_sugeridos.map((item) => cleanText(item)).filter((item): item is string => Boolean(item))
    : splitResourceTags(cleanText(planJson?.resources) ?? cleanText(planJson?.recursos) ?? fallback);

  return dedupeValues(values.map((item) => cleanResourceLabel(item)).filter((item): item is string => Boolean(item))).slice(0, 10);
};

const normalizeResourcesText = (planJson: Record<string, unknown> | null, fallback: string | null) => {
  const resources = normalizeResourceTags(planJson, fallback);
  return resources.length ? resources.join(", ") : fallback;
};

const defaultMethodologicalRecommendations =
  "Usar apoyos visuales y códigos de color para diferenciar ideas clave; presentar ejemplos guiados antes del trabajo autónomo; combinar trabajo individual y colaborativo; registrar errores frecuentes durante la actividad; cerrar con una síntesis formativa y preguntas de verificación.";

const normalizeSuggestions = ({
  planJson,
  evaluationCriteria,
  objective,
  resources
}: {
  planJson: Record<string, unknown> | null;
  evaluationCriteria: string | null;
  objective: string;
  resources: string | null;
}) => {
  const suggestion =
    cleanText(planJson?.sugerencias_metodologicas) ??
    cleanText(planJson?.sugerencias_metodológicas) ??
    cleanText(planJson?.recomendaciones_metodologicas) ??
    cleanText(planJson?.recomendaciones_metodológicas);

  if (!suggestion) {
    return defaultMethodologicalRecommendations;
  }

  const normalizedSuggestion = suggestion.toLowerCase().trim();
  const repeatedValues = [evaluationCriteria, objective, resources]
    .map((value) => value?.toLowerCase().trim())
    .filter((value): value is string => Boolean(value));

  if (repeatedValues.some((value) => value === normalizedSuggestion)) {
    return defaultMethodologicalRecommendations;
  }

  return suggestion;
};

const normalizeModality = (planJson: Record<string, unknown> | null) =>
  cleanText(planJson?.modalidad) ?? cleanText(planJson?.modality) ?? "Presencial";

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

const buildSuggestedDistribution = (durationMinutes: number | null) => {
  if (!durationMinutes || durationMinutes <= 0) {
    return null;
  }

  const inicio = Math.max(1, Math.round(durationMinutes * 0.2));
  const cierre = Math.max(1, Math.round(durationMinutes * 0.2));
  const desarrollo = Math.max(1, durationMinutes - inicio - cierre);

  return { inicio, desarrollo, cierre };
};

const getMinutesForMoment = (moment: string, distribution: NormalizedPlanExport["distribution"]) => {
  if (!distribution) {
    return null;
  }

  const normalizedMoment = moment.toLowerCase();

  if (normalizedMoment.includes("inicio")) {
    return distribution.inicio;
  }

  if (normalizedMoment.includes("desarrollo")) {
    return distribution.desarrollo;
  }

  if (normalizedMoment.includes("cierre")) {
    return distribution.cierre;
  }

  return null;
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
}): PlanMomentExport[] => {
  const rows: PlanMomentExport[] = [];

  if (inicio.trim()) {
    rows.push({
      moment: "Inicio",
      minutes: distribution?.inicio ?? null,
      activityName: "Activación de saberes",
      description: inicio,
      technique: "N/D"
    });
  }

  if (desarrollo.trim()) {
    rows.push({
      moment: "Desarrollo",
      minutes: distribution?.desarrollo ?? null,
      activityName: "Construcción del aprendizaje",
      description: desarrollo,
      technique: "N/D"
    });
  }

  if (cierre.trim()) {
    rows.push({
      moment: "Cierre",
      minutes: distribution?.cierre ?? null,
      activityName: "Síntesis y verificación",
      description: cierre,
      technique: "N/D"
    });
  }

  if (rows.length > 0) {
    return rows;
  }

  return [
    {
      moment: "Inicio",
      minutes: null,
      activityName: "Inicio de la clase",
      description: "No registrado",
      technique: "N/D"
    },
    {
      moment: "Desarrollo",
      minutes: null,
      activityName: topic ? `Desarrollo: ${topic}` : "Desarrollo de la clase",
      description: objective || "No registrado",
      technique: "N/D"
    },
    {
      moment: "Cierre",
      minutes: null,
      activityName: "Cierre de la clase",
      description: "No registrado",
      technique: "N/D"
    }
  ];
};

export const normalizePlanForExport = (plan: RawPlanRecord): NormalizedPlanExport => {
  const group = Array.isArray(plan.groups) ? plan.groups[0] : plan.groups;
  const planJson = plan.plan_json && typeof plan.plan_json === "object" ? (plan.plan_json as Record<string, unknown>) : null;
  const refuerzo = planJson?.refuerzo && typeof planJson.refuerzo === "object" ? (planJson.refuerzo as Record<string, unknown>) : null;
  const normalizedEvaluationType = normalizeEvaluationType(planJson?.evaluation_type ?? plan.evaluation_type) ?? "otra";
  const title = cleanText(planJson?.title) ?? plan.title;
  const subject = cleanText(planJson?.subject) ?? plan.subject;
  const topic = cleanText(planJson?.topic) ?? plan.topic;
  const durationMinutes = cleanNumber(planJson?.duration_minutes) ?? plan.duration_minutes;
  const objective =
    cleanText(planJson?.objetivo) ??
    cleanText(planJson?.objective_refuerzo) ??
    cleanText(refuerzo?.objective_refuerzo) ??
    cleanText(planJson?.objective) ??
    plan.objective;
  const rawResources = cleanText(planJson?.resources) ?? cleanText(planJson?.recursos) ?? plan.resources;
  const resources = normalizeResourcesText(planJson, rawResources);
  const inicio = cleanText(planJson?.inicio) ?? "";
  const desarrollo = cleanText(planJson?.desarrollo) ?? "";
  const cierre = cleanText(planJson?.cierre) ?? "";
  const distribution = normalizeLegacyDistribution(planJson?.distribucion_tiempo) ?? buildSuggestedDistribution(durationMinutes);
  const momentsFromJson = normalizeMomentsFromArray(planJson?.momentos);
  const evaluationCriteria = cleanText(planJson?.criterio_evaluacion) ?? cleanText(refuerzo?.criterio_evaluacion);
  const isReinforcement = Boolean(
    Boolean(refuerzo) ||
      cleanText(planJson?.objective_refuerzo) ||
      cleanText(refuerzo?.objective_refuerzo) ||
      cleanText(planJson?.breve_diagnostico) ||
      cleanText(planJson?.diagnostico_breve) ||
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
    inicio: inicio || "No registrado",
    desarrollo: desarrollo || "No registrado",
    cierre: cierre || "No registrado",
    distribution,
    observations: cleanText(planJson?.observaciones_docente) ?? cleanText(planJson?.observaciones_docentes),
    suggestions: normalizeSuggestions({
      planJson,
      evaluationCriteria,
      objective,
      resources
    }),
    aiAssisted: Boolean(planJson?.generated_with_ai || planJson?.ai_mode),
    groupName: group?.name ?? "Grupo",
    educationLevel: group?.level ?? null,
    moments:
      momentsFromJson.length > 0
        ? momentsFromJson.map((moment) => ({
            ...moment,
            minutes: moment.minutes ?? getMinutesForMoment(moment.moment, distribution)
          }))
        : normalizeMomentsFromLegacy({
            inicio,
            desarrollo,
            cierre,
            distribution,
            topic,
            objective
          }),
    resourceTags: normalizeResourceTags(planJson, resources),
    evaluationCriteria,
    diagnosis: cleanText(planJson?.breve_diagnostico) ?? cleanText(planJson?.diagnostico_breve) ?? cleanText(refuerzo?.breve_diagnostico),
    teacherRecommendations:
      cleanText(planJson?.recomendaciones_docente) ??
      cleanText(refuerzo?.recomendaciones_docente) ??
      cleanText(planJson?.observaciones_docentes) ??
      cleanText(planJson?.observaciones_docente),
    isReinforcement,
    modality: normalizeModality(planJson)
  };
};
