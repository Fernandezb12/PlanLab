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
};

export const normalizePlanForExport = (plan: RawPlanRecord): NormalizedPlanExport => {
  const group = Array.isArray(plan.groups) ? plan.groups[0] : plan.groups;
  const planJson = plan.plan_json && typeof plan.plan_json === "object" ? (plan.plan_json as Record<string, unknown>) : null;
  const normalizedEvaluationType = normalizeEvaluationType(planJson?.evaluation_type ?? plan.evaluation_type) ?? "otra";

  return {
    title: typeof planJson?.title === "string" ? planJson.title : plan.title,
    subject: typeof planJson?.subject === "string" ? planJson.subject : plan.subject,
    topic: typeof planJson?.topic === "string" ? planJson.topic : plan.topic,
    durationMinutes: typeof planJson?.duration_minutes === "number" ? planJson.duration_minutes : plan.duration_minutes,
    objective: typeof planJson?.objective === "string" ? planJson.objective : plan.objective,
    evaluationType: getEvaluationTypeLabel(normalizedEvaluationType),
    resources:
      typeof planJson?.resources === "string"
        ? planJson.resources
        : plan.resources,
    inicio: typeof planJson?.inicio === "string" ? planJson.inicio : "Sin bloque de inicio registrado.",
    desarrollo: typeof planJson?.desarrollo === "string" ? planJson.desarrollo : "Sin bloque de desarrollo registrado.",
    cierre: typeof planJson?.cierre === "string" ? planJson.cierre : "Sin bloque de cierre registrado.",
    distribution:
      planJson?.distribucion_tiempo && typeof planJson.distribucion_tiempo === "object"
        ? (planJson.distribucion_tiempo as { inicio: number; desarrollo: number; cierre: number })
        : null,
    observations: typeof planJson?.observaciones_docente === "string" ? planJson.observaciones_docente : null,
    suggestions: typeof planJson?.sugerencias_metodologicas === "string" ? planJson.sugerencias_metodologicas : null,
    aiAssisted: Boolean(planJson?.generated_with_ai || planJson?.ai_mode),
    groupName: group?.name ?? "Grupo",
    educationLevel: group?.level ?? null
  };
};
