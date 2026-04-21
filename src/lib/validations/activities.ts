import { z } from "zod";

export const activityStatuses = ["scheduled", "in_progress", "pending_record", "completed"] as const;

export const activityStatusLabels: Record<(typeof activityStatuses)[number], string> = {
  scheduled: "Programada",
  in_progress: "En curso",
  pending_record: "Pendiente de registro",
  completed: "Finalizada"
};

export const getActivityStatusLabel = (status: string) =>
  activityStatusLabels[status as keyof typeof activityStatusLabels] ?? "Programada";

export const activitySchema = z.object({
  id: z.string().uuid().optional(),
  lessonPlanId: z.string().uuid("Selecciona un plan válido"),
  groupId: z.string().uuid("Selecciona un grupo válido"),
  title: z.string().trim().min(3, "Ingresa un título para la actividad"),
  activityDate: z.string().min(1, "Selecciona una fecha"),
  status: z.enum(activityStatuses, {
    errorMap: () => ({ message: "Selecciona un estado válido" })
  }),
  notes: z.string().trim().max(2000, "Las notas son demasiado largas").optional().or(z.literal(""))
});

export const activityRecordInputSchema = z.object({
  studentId: z.string().uuid("Estudiante inválido"),
  attended: z.boolean(),
  resultScore: z
    .union([z.number(), z.nan()])
    .transform((value) => (Number.isNaN(value) ? null : value))
    .pipe(z.number().nullable()),
  observation: z.string().trim().max(500, "La observación es demasiado larga").optional().or(z.literal(""))
});

export const saveActivityRecordsSchema = z.object({
  activityId: z.string().uuid("Actividad inválida"),
  records: z.array(activityRecordInputSchema).min(1, "No hay registros para guardar")
});

export type ActivityInput = z.infer<typeof activitySchema>;
export type ActivityRecordInput = z.infer<typeof activityRecordInputSchema>;
export type SaveActivityRecordsInput = z.infer<typeof saveActivityRecordsSchema>;
