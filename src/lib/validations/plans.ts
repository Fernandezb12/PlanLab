import { z } from "zod";

export const planStatuses = ["draft", "ready", "archived"] as const;
export const evaluationTypes = ["diagnóstica", "formativa", "sumativa", "observación", "otra"] as const;

export const planStatusLabels: Record<(typeof planStatuses)[number], string> = {
  draft: "Borrador",
  ready: "Listo",
  archived: "Archivado"
};

export const evaluationTypeLabels: Record<(typeof evaluationTypes)[number], string> = {
  diagnóstica: "Diagnóstica",
  formativa: "Formativa",
  sumativa: "Sumativa",
  observación: "Observación",
  otra: "Otra"
};

export const getPlanStatusLabel = (status: string) =>
  planStatusLabels[status as keyof typeof planStatusLabels] ?? "Borrador";

export const getEvaluationTypeLabel = (evaluationType: string) =>
  evaluationTypeLabels[evaluationType as keyof typeof evaluationTypeLabels] ?? "Otra";

export const planSchema = z.object({
  id: z.string().uuid().optional(),
  groupId: z.string().uuid("Selecciona un grupo válido"),
  title: z.string().trim().min(3, "Ingresa un título para el plan"),
  subject: z.string().trim().min(2, "Ingresa el área o asignatura"),
  topic: z.string().trim().min(2, "Ingresa el tema"),
  durationMinutes: z.coerce.number().int("La duración debe ser un número entero").min(1, "Ingresa una duración válida"),
  objective: z.string().trim().min(10, "Describe un objetivo claro para el plan"),
  resources: z.string().trim().max(2000, "Los recursos son demasiado largos").optional().or(z.literal("")),
  evaluationType: z.enum(evaluationTypes, {
    errorMap: () => ({ message: "Selecciona un tipo de evaluación válido" })
  }),
  status: z.enum(planStatuses, {
    errorMap: () => ({ message: "Selecciona un estado válido" })
  })
});

export type PlanInput = z.infer<typeof planSchema>;
