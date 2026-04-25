import { z } from "zod";

import { evaluationTypeSchema } from "@/lib/validations/plans";

const boundedText = (label: string, min = 8, max = 3000) =>
  z
    .string()
    .trim()
    .min(min, `Completa ${label}`)
    .max(max, `${label} es demasiado extenso`);

export const timeDistributionSchema = z.object({
  inicio: z.coerce.number().int().min(1),
  desarrollo: z.coerce.number().int().min(1),
  cierre: z.coerce.number().int().min(1)
});

export const lessonMomentSchema = z.object({
  momento: z.enum(["Inicio", "Desarrollo", "Cierre", "Evaluación"]),
  tiempo_min: z.coerce.number().int().min(1).max(240),
  nombre_actividad: z.string().trim().min(3).max(180),
  descripcion: boundedText("la descripción", 10, 2400),
  tecnica: z.string().trim().min(3).max(180)
});

export const lessonPlanAISchema = z.object({
  title: boundedText("el título", 5, 160),
  subject: boundedText("el área", 2, 120),
  topic: boundedText("el tema", 2, 160),
  duration_minutes: z.coerce.number().int().min(10).max(240),
  objective: boundedText("el objetivo", 10, 800),
  objetivo: boundedText("el objetivo", 10, 800).optional(),
  evaluation_type: evaluationTypeSchema,
  resources: boundedText("los recursos", 2, 800),
  inicio: boundedText("el inicio", 10, 2000),
  desarrollo: boundedText("el desarrollo", 10, 3000),
  cierre: boundedText("el cierre", 10, 2000),
  distribucion_tiempo: timeDistributionSchema,
  momentos: z.array(lessonMomentSchema).min(3).max(4).optional(),
  criterio_evaluacion: z.string().trim().max(1200).optional().default(""),
  recursos_sugeridos: z.array(z.string().trim().min(1).max(160)).max(12).optional().default([]),
  observaciones_docente: z.string().trim().max(1200).optional().default(""),
  observaciones_docentes: z.string().trim().max(1200).optional().default(""),
  sugerencias_metodologicas: z.string().trim().max(1200).optional().default("")
});

export const generatePlanAIInputSchema = z.object({
  groupId: z.string().uuid("Selecciona un grupo válido"),
  groupName: z.string().trim().min(1),
  educationLevel: z.string().trim().optional().default(""),
  subject: boundedText("el área", 2, 120),
  topic: boundedText("el tema", 2, 160),
  durationMinutes: z.coerce.number().int().min(10).max(240),
  objective: boundedText("el objetivo", 10, 800),
  evaluationType: evaluationTypeSchema,
  resources: z.string().trim().max(1000).optional().default(""),
  context: z.string().trim().max(1200).optional().default(""),
  existingPlanId: z.string().uuid().optional(),
  existingPlanJson: lessonPlanAISchema.partial().optional().nullable(),
  existingPlanTitle: z.string().trim().max(160).optional().default("")
});

export const reinforcementAISchema = z.object({
  objective_refuerzo: boundedText("el objetivo de refuerzo", 10, 800),
  breve_diagnostico: boundedText("el diagnóstico", 10, 1200),
  inicio: boundedText("el inicio", 10, 2000),
  desarrollo: boundedText("el desarrollo", 10, 3000),
  cierre: boundedText("el cierre", 10, 2000),
  distribucion_tiempo: timeDistributionSchema,
  recursos: boundedText("los recursos", 2, 800),
  criterio_evaluacion: boundedText("el criterio de evaluación", 10, 800),
  recomendaciones_docente: boundedText("las recomendaciones", 10, 1200)
});

export const generateReinforcementInputSchema = z.object({
  groupId: z.string().uuid("Grupo inválido"),
  groupName: z.string().trim().min(1),
  educationLevel: z.string().trim().optional().default(""),
  subject: z.string().trim().min(1, "Área inválida"),
  topic: z.string().trim().min(1, "Tema inválido"),
  activityTitle: z.string().trim().optional().default(""),
  averageScore: z.number().nullable(),
  attendanceRate: z.number().nullable(),
  observations: z.array(z.string().trim()).max(8).default([]),
  lowPerformanceSummary: z.string().trim().max(1200).optional().default(""),
  durationMinutes: z.coerce.number().int().min(20).max(180).default(45)
});

export type LessonPlanAI = z.infer<typeof lessonPlanAISchema>;
export type GeneratePlanAIInput = z.infer<typeof generatePlanAIInputSchema>;
export type ReinforcementPlanAI = z.infer<typeof reinforcementAISchema>;
export type GenerateReinforcementInput = z.infer<typeof generateReinforcementInputSchema>;
