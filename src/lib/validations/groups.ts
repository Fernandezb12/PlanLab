import { z } from "zod";

import { normalizeEducationLevel } from "@/lib/constants/education";

export const studentStatuses = ["activo", "seguimiento", "inactivo"] as const;

export const groupSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2, "Ingresa un nombre de grupo"),
  level: z
    .string()
    .trim()
    .min(1, "Selecciona el nivel educativo")
    .refine((value) => Boolean(normalizeEducationLevel(value)), "Selecciona el nivel educativo"),
  subject: z.string().trim().min(2, "Ingresa el área o asignatura"),
  period: z.string().trim().max(80, "El período es demasiado largo").optional().or(z.literal(""))
});

export const studentSchema = z.object({
  id: z.string().uuid().optional(),
  fullName: z.string().trim().min(3, "Ingresa el nombre completo del estudiante"),
  studentCode: z.string().trim().max(50, "El código es demasiado largo").optional().or(z.literal("")),
  groupId: z.string().uuid("Selecciona un grupo válido"),
  status: z.enum(studentStatuses, {
    errorMap: () => ({ message: "Selecciona un estado válido" })
  }),
  notes: z.string().trim().max(240, "La observación es demasiado larga").optional().or(z.literal(""))
});

export const importedStudentPreviewSchema = z.object({
  rowNumber: z.number().int().positive(),
  fullName: z.string().trim().min(1, "El nombre es obligatorio"),
  studentCode: z.string().trim().max(50, "El código es demasiado largo").nullable(),
  status: z.enum(studentStatuses),
  notes: z.string().trim().max(240, "La observación es demasiado larga").nullable()
});

export const importStudentsInputSchema = z.object({
  groupId: z.string().uuid("Selecciona un grupo válido"),
  students: z.array(importedStudentPreviewSchema).min(1, "No hay estudiantes válidos para importar")
});

export type GroupInput = z.infer<typeof groupSchema>;
export type StudentInput = z.infer<typeof studentSchema>;
export type ImportedStudentPreviewInput = z.infer<typeof importedStudentPreviewSchema>;
export type ImportStudentsInput = z.infer<typeof importStudentsInputSchema>;
