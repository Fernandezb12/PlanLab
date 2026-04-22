import { z } from "zod";

export const planStatuses = ["draft", "ready", "archived"] as const;
export const evaluationTypes = ["diagnostica", "formativa", "sumativa", "observacion", "otra"] as const;

export const planStatusLabels: Record<(typeof planStatuses)[number], string> = {
  draft: "Borrador",
  ready: "Listo",
  archived: "Archivado"
};

export const evaluationTypeLabels: Record<(typeof evaluationTypes)[number], string> = {
  diagnostica: "Diagnóstica",
  formativa: "Formativa",
  sumativa: "Sumativa",
  observacion: "Observación",
  otra: "Otra"
};

const normalizeTextToken = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

export const normalizeEvaluationType = (value: unknown): (typeof evaluationTypes)[number] | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalizedValue = normalizeTextToken(value)
    .replace(/[^a-z]+/g, " ")
    .trim()
    .replace(/\s+/g, "_");

  const aliases: Record<string, (typeof evaluationTypes)[number]> = {
    diagnostica: "diagnostica",
    diagnostico: "diagnostica",
    evaluacion_diagnostica: "diagnostica",
    formativa: "formativa",
    evaluacion_formativa: "formativa",
    sumativa: "sumativa",
    evaluacion_sumativa: "sumativa",
    observacion: "observacion",
    observacional: "observacion",
    evaluacion_observacion: "observacion",
    otra: "otra",
    otro: "otra"
  };

  return aliases[normalizedValue];
};

export const isEvaluationType = (value: unknown): value is (typeof evaluationTypes)[number] =>
  typeof normalizeEvaluationType(value) !== "undefined";

export const evaluationTypeSchema = z.preprocess(
  (value) => normalizeEvaluationType(value) ?? value,
  z.enum(evaluationTypes, {
    errorMap: () => ({ message: "Selecciona un tipo de evaluación válido" })
  })
);

export const getPlanStatusLabel = (status: string) =>
  planStatusLabels[status as keyof typeof planStatusLabels] ?? "Borrador";

export const getEvaluationTypeLabel = (evaluationType: string) =>
  evaluationTypeLabels[normalizeEvaluationType(evaluationType) ?? "otra"];

export const planJsonSchema = z
  .object({
    title: z.string().trim().min(1).optional(),
    subject: z.string().trim().min(1).optional(),
    topic: z.string().trim().min(1).optional(),
    duration_minutes: z.number().int().positive().optional(),
    objective: z.string().trim().min(1).optional(),
    resources: z.union([z.string(), z.null()]).optional(),
    evaluation_type: z.preprocess((value) => normalizeEvaluationType(value) ?? value, z.string().trim().min(1)).optional(),
    status: z.string().trim().min(1).optional(),
    inicio: z.string().trim().min(1).optional(),
    desarrollo: z.string().trim().min(1).optional(),
    cierre: z.string().trim().min(1).optional(),
    distribucion_tiempo: z
      .object({
        inicio: z.number().int().positive(),
        desarrollo: z.number().int().positive(),
        cierre: z.number().int().positive()
      })
      .optional(),
    observaciones_docente: z.string().trim().optional(),
    sugerencias_metodologicas: z.string().trim().optional(),
    refuerzo: z.record(z.any()).optional()
  })
  .passthrough()
  .optional();

export const planSchema = z.object({
  id: z.string().uuid().optional(),
  groupId: z.string().uuid("Selecciona un grupo válido"),
  title: z.string().trim().min(3, "Ingresa un título para el plan"),
  subject: z.string().trim().min(2, "Ingresa el área o asignatura"),
  topic: z.string().trim().min(2, "Ingresa el tema"),
  durationMinutes: z.coerce.number().int("La duración debe ser un número entero").min(1, "Ingresa una duración válida"),
  objective: z.string().trim().min(10, "Describe un objetivo claro para el plan"),
  resources: z.string().trim().max(2000, "Los recursos son demasiado largos").optional().or(z.literal("")),
  evaluationType: evaluationTypeSchema,
  status: z.enum(planStatuses, {
    errorMap: () => ({ message: "Selecciona un estado válido" })
  }),
  planJson: planJsonSchema
});

export type PlanInput = z.infer<typeof planSchema>;
